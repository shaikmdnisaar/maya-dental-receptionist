import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, notFound, serverError } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await getTenantContext();
    const call = await prisma.call.findFirst({
      where: { id: params.id, clinicId: ctx.clinicId },
      include: {
        patient: true,
        agent: { include: { config: true } },
        transcript: true,
        events: { orderBy: { createdAt: "asc" } },
        appointment: { include: { dentist: true, type: true } },
      },
    });
    if (!call) return notFound("Call not found");
    // Parse transcript segments from JSON string (SQLite compatibility)
    const result = call as any;
    if (result.transcript?.segments) {
      try {
        result.transcript.segments = JSON.parse(result.transcript.segments);
      } catch {}
    }
    return ok(result);
  } catch (e) {
    return serverError((e as Error).message);
  }
}