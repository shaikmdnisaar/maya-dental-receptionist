import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { updateAgentSchema } from "@/validators";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const agents = await prisma.aIAgent.findMany({
      where: { clinicId: ctx.clinicId },
      include: { config: true, calls: { take: 5, orderBy: { startedAt: "desc" } } },
    });
    return ok(agents);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const { agentId, ...data } = body;
    const parsed = updateAgentSchema.parse(data);
    const agent = await prisma.aIAgent.findFirst({
      where: { id: agentId, clinicId: ctx.clinicId },
    });
    if (!agent) return ok({ error: "Agent not found" }, 404);
    const updated = await prisma.aIAgent.update({
      where: { id: agentId },
      data: parsed,
      include: { config: true },
    });
    return ok(updated);
  } catch (e) {
    return handleZodError(e);
  }
}