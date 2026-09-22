import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { createAppointmentSchema } from "@/validators";
import { bookAppointment } from "@/lib/appointments/service";

export async function GET(req: Request) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const dentistId = searchParams.get("dentistId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId: ctx.clinicId,
        ...(dentistId && dentistId !== "all" ? { dentistId } : {}),
        ...(status && status !== "all" ? { status: status as any } : {}),
        ...(from || to
          ? {
              startTime: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
              },
            }
          : {}),
      },
      include: { patient: true, dentist: true, type: true, call: true },
      orderBy: { startTime: "asc" },
    });

    return ok(appointments);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const data = createAppointmentSchema.parse(body);
    const appt = await bookAppointment({
      clinicId: ctx.clinicId,
      patientId: data.patientId,
      dentistId: data.dentistId,
      typeId: data.typeId ?? null,
      startTime: data.startTime as string,
      endTime: data.endTime as string | undefined,
      notes: data.notes,
      source: data.source,
    });
    return ok(appt, 201);
  } catch (e) {
    return handleZodError(e);
  }
}