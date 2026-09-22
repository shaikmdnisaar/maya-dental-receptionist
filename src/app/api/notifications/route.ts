import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const notifications = await prisma.notification.findMany({
      where: { clinicId: ctx.clinicId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return ok(notifications);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    await prisma.notification.updateMany({
      where: { clinicId: ctx.clinicId, id: body.id },
      data: { read: true },
    });
    return ok({ updated: true });
  } catch (e) {
    return serverError((e as Error).message);
  }
}