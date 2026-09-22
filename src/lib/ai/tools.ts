// AI agent tools — the AI calls these instead of touching the DB directly.
// Used by the voice provider / test console / webhook handlers.

import { prisma } from "@/lib/db";
import { bookAppointment, getAvailableSlots, rescheduleAppointment, cancelAppointment } from "@/lib/appointments/service";
import { getMessagingProvider } from "@/lib/messaging/provider";
import type { AgentToolResult } from "@/types";

export interface AgentContext {
  clinicId: string;
  agentId: string;
  callId?: string;
  patientId?: string | null;
}

export async function getClinicInfo(ctx: AgentContext): Promise<AgentToolResult> {
  const clinic = await prisma.clinic.findUnique({ where: { id: ctx.clinicId } });
  if (!clinic) return { ok: false, error: "Clinic not found" };
  return {
    ok: true,
    data: {
      name: clinic.name,
      phone: clinic.phone,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      zip: clinic.zip,
      email: clinic.email,
      website: clinic.website,
      timezone: clinic.timezone,
    },
  };
}

export async function getBusinessHours(ctx: AgentContext): Promise<AgentToolResult> {
  const hours = await prisma.businessHours.findMany({
    where: { clinicId: ctx.clinicId },
    orderBy: { dayOfWeek: "asc" },
  });
  return { ok: true, data: hours };
}

export async function searchKnowledge(
  ctx: AgentContext,
  query: string
): Promise<AgentToolResult> {
  const docs = await prisma.knowledgeDocument.findMany({
    where: {
      clinicId: ctx.clinicId,
      active: true,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { tags: { contains: query.toLowerCase() } },
      ],
    },
    take: 5,
  });
  return { ok: true, data: docs };
}

export async function findPatient(
  ctx: AgentContext,
  phone: string
): Promise<AgentToolResult> {
  const patient = await prisma.patient.findFirst({
    where: { clinicId: ctx.clinicId, phone: { contains: phone } },
  });
  return { ok: true, data: patient };
}

export async function createPatient(
  ctx: AgentContext,
  input: { firstName: string; lastName: string; phone: string; email?: string }
): Promise<AgentToolResult> {
  const patient = await prisma.patient.create({
    data: {
      clinicId: ctx.clinicId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      isNew: true,
    },
  });
  return { ok: true, data: patient };
}

export async function getAvailableSlotsTool(
  ctx: AgentContext,
  dentistId: string,
  date: string
): Promise<AgentToolResult> {
  const slots = await getAvailableSlots({ dentistId, date, clinicId: ctx.clinicId });
  return { ok: true, data: slots };
}

export async function bookAppointmentTool(
  ctx: AgentContext,
  input: { patientId: string; dentistId: string; typeId?: string; startTime: string; notes?: string }
): Promise<AgentToolResult> {
  try {
    const appt = await bookAppointment({
      clinicId: ctx.clinicId,
      patientId: input.patientId,
      dentistId: input.dentistId,
      typeId: input.typeId,
      startTime: input.startTime,
      source: "voice",
      callId: ctx.callId,
      notes: input.notes,
    });
    return { ok: true, data: appt };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function rescheduleAppointmentTool(
  ctx: AgentContext,
  appointmentId: string,
  startTime: string
): Promise<AgentToolResult> {
  try {
    const appt = await rescheduleAppointment(appointmentId, { startTime });
    return { ok: true, data: appt };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function cancelAppointmentTool(
  ctx: AgentContext,
  appointmentId: string
): Promise<AgentToolResult> {
  try {
    const appt = await cancelAppointment(appointmentId);
    return { ok: true, data: appt };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function sendConfirmation(
  ctx: AgentContext,
  input: { patientId: string; appointmentId: string }
): Promise<AgentToolResult> {
  const appt = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: { patient: true, dentist: true, type: true },
  });
  if (!appt) return { ok: false, error: "Appointment not found" };

  const time = new Date(appt.startTime).toLocaleString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
  const body = `Hi ${appt.patient.firstName}, this is Mass Dental Clinical. Your ${appt.type?.name ?? "appointment"} with ${appt.dentist.name} is confirmed for ${time}. Reply C to confirm or R to reschedule.`;

  const provider = getMessagingProvider();
  const msg = await provider.send({ to: appt.patient.phone, body, channel: "SMS" });

  // Persist to conversation.
  let convo = await prisma.conversation.findFirst({
    where: { clinicId: ctx.clinicId, patientId: appt.patientId },
  });
  if (!convo) {
    convo = await prisma.conversation.create({
      data: {
        clinicId: ctx.clinicId,
        patientId: appt.patientId,
        channel: "SMS",
        patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
        patientPhone: appt.patient.phone,
      },
    });
  }
  await prisma.message.create({
    data: {
      conversationId: convo.id,
      patientId: appt.patientId,
      channel: "SMS",
      direction: "outbound",
      body,
      status: msg.status,
      senderKind: "agent",
    },
  });

  return { ok: true, data: { messageId: msg.id, body } };
}

export async function transferToHuman(
  ctx: AgentContext,
  reason: string
): Promise<AgentToolResult> {
  if (ctx.callId) {
    await prisma.call.update({
      where: { id: ctx.callId },
      data: { transferred: true, transferReason: reason, status: "TRANSFERRED" },
    });
  }
  return { ok: true, data: { transferred: true, reason } };
}

export const agentTools = {
  getClinicInfo,
  getBusinessHours,
  searchKnowledge,
  findPatient,
  createPatient,
  getAvailableSlots: getAvailableSlotsTool,
  bookAppointment: bookAppointmentTool,
  rescheduleAppointment: rescheduleAppointmentTool,
  cancelAppointment: cancelAppointmentTool,
  sendConfirmation,
  transferToHuman,
};