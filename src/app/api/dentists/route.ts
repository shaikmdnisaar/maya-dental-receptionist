import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const dentists = await prisma.dentist.findMany({
      where: { clinicId: ctx.clinicId, active: true },
      include: { schedules: true },
      orderBy: { name: "asc" },
    });
    return ok(dentists);
  } catch (e) {
    return serverError((e as Error).message);
  }
}