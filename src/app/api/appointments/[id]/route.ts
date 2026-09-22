import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, notFound, serverError, handleZodError, badRequest } from "@/lib/api";
import { rescheduleAppointmentSchema, updateAppointmentStatusSchema } from "@/validators";
import { rescheduleAppointment, cancelAppointment } from "@/lib/appointments/service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const appt = await prisma.appointment.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
      include: { patient: true, dentist: true, type: true, call: true },
    });
    if (!appt) return notFound("Appointment not found");
    return ok(appt);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const existing = await prisma.appointment.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
    });
    if (!existing) return notFound("Appointment not found");

    if (body.action === "reschedule") {
      const data = rescheduleAppointmentSchema.parse(body);
      const appt = await rescheduleAppointment(params.id, {
        startTime: data.startTime,
        endTime: data.endTime,
        dentistId: data.dentistId,
      });
      return ok(appt);
    }
    if (body.action === "cancel") {
      const appt = await cancelAppointment(params.id);
      return ok(appt);
    }
    // Default: status update
    const data = updateAppointmentStatusSchema.parse(body);
    const appt = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: data.status },
      include: { patient: true, dentist: true, type: true },
    });
    return ok(appt);
  } catch (e) {
    return handleZodError(e);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const existing = await prisma.appointment.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
    });
    if (!existing) return notFound("Appointment not found");
    const appt = await cancelAppointment(params.id);
    return ok(appt);
  } catch (e) {
    return serverError((e as Error).message);
  }
}