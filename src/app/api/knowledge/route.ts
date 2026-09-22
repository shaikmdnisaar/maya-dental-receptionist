import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError, notFound } from "@/lib/api";
import { createKnowledgeSchema, updateKnowledgeSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const docs = await prisma.knowledgeDocument.findMany({
      where: {
        clinicId: ctx.clinicId,
        ...(category && category !== "all" ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { content: { contains: search } },
                { tags: { contains: search.toLowerCase() } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    // Parse tags from JSON string (SQLite compatibility)
    const parsed = docs.map((d: any) => ({
      ...d,
      tags: (() => { try { return JSON.parse(d.tags); } catch { return []; } })(),
    }));
    return ok(parsed);
  } catch (e) {
    return serverError((e as Error).message);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const data = createKnowledgeSchema.parse(body);
    const doc = await prisma.knowledgeDocument.create({
      data: { clinicId: ctx.clinicId, ...data, tags: JSON.stringify(data.tags) },
    });
    // Chunk for future RAG.
    const chunks = data.content.match(/.{1,300}/g) ?? [data.content];
    for (const chunk of chunks) {
      await prisma.knowledgeChunk.create({
        data: { documentId: doc.id, content: chunk, embedding: "[]" },
      });
    }
    return ok(doc, 201);
  } catch (e) {
    return handleZodError(e);
  }
}