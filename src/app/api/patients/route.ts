import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { createPatientSchema, updatePatientSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const patients = await prisma.patient.findMany({
      where: {
        clinicId: ctx.clinicId,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
      include: {
        appointments: { orderBy: { startTime: "desc" }, take: 1 },
        calls: { orderBy: { startedAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(patients);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const data = createPatientSchema.parse(body);
    const patient = await prisma.patient.create({
      data: { clinicId: ctx.clinicId, ...data, isNew: true },
    });
    return ok(patient, 201);
  } catch (e) {
    return handleZodError(e);
  }
}