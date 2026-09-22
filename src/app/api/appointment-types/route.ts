import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const types = await prisma.appointmentType.findMany({
      where: { clinicId: ctx.clinicId, active: true },
      orderBy: { name: "asc" },
    });
    return ok(types);
  } catch (e) {
    return serverError((e as Error).message);
  }
}