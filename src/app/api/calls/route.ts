import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const calls = await prisma.call.findMany({
      where: {
        clinicId: ctx.clinicId,
        ...(status && status !== "all"
          ? status === "MISSED"
            ? { status: "MISSED" }
            : status === "TRANSFERRED"
              ? { transferred: true }
              : status === "BOOKED"
                ? { outcome: { contains: "Booked" } }
                : status === "EMERGENCY"
                  ? { sentiment: "Urgent" }
                  : { status: status as any }
          : {}),
        ...(search
          ? {
              OR: [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { phoneNumber: { contains: search } },
                { intent: { contains: search } },
              ],
            }
          : {}),
      },
      include: { patient: true, agent: true, appointment: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    });

    return ok(calls);
  } catch (e) {
    return serverError((e as Error).message);
  }
}