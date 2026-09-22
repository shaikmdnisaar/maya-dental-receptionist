import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, notFound, serverError, handleZodError } from "@/lib/api";
import { updateAgentConfigSchema } from "@/validators";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const agent = await prisma.aIAgent.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
      include: { config: true },
    });
    if (!agent) return notFound("Agent not found");

    const body = await req.json();
    const data = updateAgentConfigSchema.parse(body);

    if (agent.config) {
      const config = await prisma.agentConfig.update({
        where: { agentId: agent.id },
        data,
      });
      return ok(config);
    }
    // Create config if missing
    const config = await prisma.agentConfig.create({
      data: {
        agentId: agent.id,
        greeting: data.greeting ?? "Hi, this is Maya with Mass Dental Clinical. How can I help?",
        ...data,
      } as any,
    });
    return ok(config);
  } catch (e) {
    return handleZodError(e);
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const agent = await prisma.aIAgent.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
      include: { config: true },
    });
    if (!agent) return notFound("Agent not found");
    return ok(agent);
  } catch (e) {
    return serverError((e as Error).message);
  }
}