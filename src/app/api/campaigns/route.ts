import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { campaignSchema } from "@/validators";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const campaigns = await prisma.campaign.findMany({
      where: { clinicId: ctx.clinicId },
      include: { agent: true, _count: { select: { contacts: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok(campaigns);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const data = campaignSchema.parse(body);
    const campaign = await prisma.campaign.create({
      data: { clinicId: ctx.clinicId, ...data, agentId: data.agentId ?? null },
    });
    return ok(campaign, 201);
  } catch (e) {
    return handleZodError(e);
  }
}