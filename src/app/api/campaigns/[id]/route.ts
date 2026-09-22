import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, notFound, serverError } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const existing = await prisma.campaign.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
    });
    if (!existing) return notFound("Campaign not found");
    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: { active: body.active },
    });
    return ok(campaign);
  } catch (e) {
    return serverError((e as Error).message);
  }
}