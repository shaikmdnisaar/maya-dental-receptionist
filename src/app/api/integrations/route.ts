import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { integrationUpdateSchema } from "@/validators";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const integrations = await prisma.integration.findMany({
      where: { clinicId: ctx.clinicId },
      orderBy: { type: "asc" },
    });
    return ok(integrations);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const { integrationId, ...data } = body;
    const parsed = integrationUpdateSchema.parse(data);
    const existing = await prisma.integration.findFirst({
      where: { id: integrationId, clinicId: ctx.clinicId },
    });
    if (!existing) return ok({ error: "Integration not found" }, 404);
    const integration = await prisma.integration.update({
      where: { id: integrationId },
      data: parsed,
    });
    return ok(integration);
  } catch (e) {
    return handleZodError(e);
  }
}