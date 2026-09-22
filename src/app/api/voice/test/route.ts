import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { voiceTestSchema } from "@/validators";
import { getScenario, SCENARIOS } from "@/lib/voice/simulator";

// Returns the list of available test scenarios.
export async function GET() {
  try {
    await getTenantContext();
    return ok(
      SCENARIOS.map((s) => ({
        id: s.id,
        label: s.label,
        intent: s.intent,
        outcome: s.outcome,
        patientName: s.patientName,
      }))
    );
  } catch (e) {
    return serverError((e as Error).message);
  }
}

// Starts a mock test call — returns the scenario script the frontend will stream.
export async function POST(req: Request) {
  try {
    const ctx = await getTenantContext();
    const body = await req.json();
    const data = voiceTestSchema.parse(body);

    const agent = await prisma.aIAgent.findFirst({
      where: { id: data.agentId, clinicId: ctx.clinicId },
      include: { config: true },
    });
    if (!agent) return ok({ error: "Agent not found" }, 404);

    const scenario = getScenario(data.scenario);
    return ok({
      callId: `test_${Date.now()}`,
      agent: { id: agent.id, name: agent.name, voice: agent.voice, language: agent.language },
      scenario: {
        id: scenario.id,
        label: scenario.label,
        intent: scenario.intent,
        outcome: scenario.outcome,
        patientName: scenario.patientName,
        segments: scenario.segments,
      },
    });
  } catch (e) {
    return handleZodError(e);
  }
}