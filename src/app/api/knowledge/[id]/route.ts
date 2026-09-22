import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, notFound, serverError, handleZodError } from "@/lib/api";
import { updateKnowledgeSchema } from "@/validators";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const existing = await prisma.knowledgeDocument.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
    });
    if (!existing) return notFound("Document not found");
    const body = await req.json();
    const data = updateKnowledgeSchema.parse(body);
    const doc = await prisma.knowledgeDocument.update({
      where: { id: params.id },
      data: { ...data, tags: data.tags ? JSON.stringify(data.tags) : undefined },
    });
    return ok(doc);
  } catch (e) {
    return handleZodError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const existing = await prisma.knowledgeDocument.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
    });
    if (!existing) return notFound("Document not found");
    await prisma.knowledgeDocument.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (e) {
    return serverError((e as Error).message);
  }
}