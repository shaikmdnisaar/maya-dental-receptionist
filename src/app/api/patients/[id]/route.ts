import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, notFound, serverError, handleZodError } from "@/lib/api";
import { updatePatientSchema } from "@/validators";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const patient = await prisma.patient.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
      include: {
        appointments: {
          include: { dentist: true, type: true },
          orderBy: { startTime: "desc" },
        },
        calls: {
          include: { agent: true },
          orderBy: { startedAt: "desc" },
        },
        messages: {
          include: { conversation: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!patient) return notFound("Patient not found");
    return ok(patient);
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
    const data = updatePatientSchema.parse(body);
    const existing = await prisma.patient.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
    });
    if (!existing) return notFound("Patient not found");
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data,
    });
    return ok(patient);
  } catch (e) {
    return handleZodError(e);
  }
}