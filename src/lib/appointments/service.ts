// Single appointment engine used by BOTH the frontend and the AI agent.
// No duplicate scheduling logic anywhere else.

import { prisma } from "@/lib/db";
import type { AvailabilitySlot } from "@/types";

const SLOT_MINUTES = 30;
const BUFFER_MINUTES = 10;
const CLINIC_OPEN = 9; // 9 AM
const CLINIC_CLOSE = 18; // 6 PM

export interface AvailabilityQuery {
  dentistId: string;
  date: string; // YYYY-MM-DD
  durationMin?: number;
  clinicId?: string;
}

function dateOnly(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getAvailableSlots(q: AvailabilityQuery): Promise<AvailabilitySlot[]> {
  const duration = q.durationMin ?? SLOT_MINUTES;
  const day = dateOnly(new Date(q.date));
  const dayEnd = new Date(day);
  dayEnd.setDate(day.getDate() + 1);

  const dentist = await prisma.dentist.findUnique({
    where: { id: q.dentistId },
    include: { schedules: true, appointments: true },
  });
  if (!dentist) return [];

  // Build schedule for the weekday (fallback to clinic hours 9-18).
  const weekday = day.getDay();
  const sched = dentist.schedules.filter((s) => s.dayOfWeek === weekday);
  const ranges =
    sched.length > 0
      ? sched.map((s) => ({ start: s.startTime, end: s.endTime }))
      : [{ start: "09:00", end: "18:00" }];

  // Existing appointments for that day.
  const existing = dentist.appointments.filter((a) => {
    const s = new Date(a.startTime);
    return s >= day && s < dayEnd && a.status !== "CANCELLED";
  });

  const slots: AvailabilitySlot[] = [];

  for (const range of ranges) {
    const [sh, sm] = range.start.split(":").map(Number);
    const [eh, em] = range.end.split(":").map(Number);
    let cursor = new Date(day);
    cursor.setHours(sh, sm, 0, 0);
    const rangeEnd = new Date(day);
    rangeEnd.setHours(eh, em, 0, 0);

    while (cursor.getTime() + duration * 60000 <= rangeEnd.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + duration * 60000);

      const conflict = existing.some((a) => {
        const aStart = new Date(a.startTime).getTime() - BUFFER_MINUTES * 60000;
        const aEnd = new Date(a.endTime).getTime() + BUFFER_MINUTES * 60000;
        return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
      });

      if (!conflict) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          dentistId: dentist.id,
          dentistName: dentist.name,
        });
      }
      cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60000);
    }
  }

  return slots;
}

export async function bookAppointment(input: {
  clinicId: string;
  patientId: string;
  dentistId: string;
  typeId?: string | null;
  startTime: string | Date;
  endTime?: string | Date;
  notes?: string;
  source?: string;
  callId?: string;
}) {
  const start = new Date(input.startTime);
  const dentist = await prisma.dentist.findUnique({
    where: { id: input.dentistId },
    include: { appointments: true },
  });
  if (!dentist) throw new Error("Dentist not found");

  const type = input.typeId
    ? await prisma.appointmentType.findUnique({ where: { id: input.typeId } })
    : null;
  const duration = type?.durationMin ?? SLOT_MINUTES;
  const end = input.endTime ? new Date(input.endTime) : new Date(start.getTime() + duration * 60000);

  // Double-booking guard.
  const conflict = dentist.appointments.some((a) => {
    if (a.status === "CANCELLED") return false;
    const aStart = new Date(a.startTime).getTime() - BUFFER_MINUTES * 60000;
    const aEnd = new Date(a.endTime).getTime() + BUFFER_MINUTES * 60000;
    return start.getTime() < aEnd && end.getTime() > aStart;
  });
  if (conflict) throw new Error("Slot unavailable — double booking prevented");

  return prisma.appointment.create({
    data: {
      clinicId: input.clinicId,
      patientId: input.patientId,
      dentistId: input.dentistId,
      typeId: input.typeId ?? null,
      startTime: start,
      endTime: end,
      status: "SCHEDULED",
      source: input.source ?? "manual",
      notes: input.notes,
      callId: input.callId ?? null,
    },
    include: { patient: true, dentist: true, type: true },
  });
}

export async function rescheduleAppointment(
  id: string,
  input: { startTime: string | Date; endTime?: string | Date; dentistId?: string }
) {
  const start = new Date(input.startTime);
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new Error("Appointment not found");

  const dentistId = input.dentistId ?? existing.dentistId;
  const dentist = await prisma.dentist.findUnique({
    where: { id: dentistId },
    include: { appointments: true },
  });
  if (!dentist) throw new Error("Dentist not found");

  const end = input.endTime
    ? new Date(input.endTime)
    : new Date(start.getTime() + (existing.endTime.getTime() - existing.startTime.getTime()));

  const conflict = dentist.appointments.some((a) => {
    if (a.id === id || a.status === "CANCELLED") return false;
    const aStart = new Date(a.startTime).getTime() - BUFFER_MINUTES * 60000;
    const aEnd = new Date(a.endTime).getTime() + BUFFER_MINUTES * 60000;
    return start.getTime() < aEnd && end.getTime() > aStart;
  });
  if (conflict) throw new Error("Slot unavailable — double booking prevented");

  return prisma.appointment.update({
    where: { id },
    data: { startTime: start, endTime: end, dentistId, status: "RESCHEDULED" },
    include: { patient: true, dentist: true, type: true },
  });
}

export async function cancelAppointment(id: string) {
  return prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { patient: true, dentist: true, type: true },
  });
}

export { SLOT_MINUTES, BUFFER_MINUTES, CLINIC_OPEN, CLINIC_CLOSE };