import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const ctx = await getTenantContext();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "7";

    const days = Number(range);
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const calls = await prisma.call.findMany({
      where: { clinicId: ctx.clinicId, startedAt: { gte: from } },
      orderBy: { startedAt: "asc" },
    });
    const appointments = await prisma.appointment.findMany({
      where: { clinicId: ctx.clinicId, createdAt: { gte: from } },
    });
    const patients = await prisma.patient.findMany({ where: { clinicId: ctx.clinicId } });

    const totalCalls = calls.length;
    const answeredCalls = calls.filter((c) => c.status === "COMPLETED").length;
    const missedCalls = calls.filter((c) => c.status === "MISSED").length;
    const transfers = calls.filter((c) => c.transferred).length;
    const apptsBooked = appointments.length;
    const apptsCancelled = appointments.filter((a) => a.status === "CANCELLED").length;
    const newPatients = patients.filter((p) => p.isNew).length;
    const afterHoursCalls = calls.filter((c) => c.isAfterHours).length;
    const avgCallDuration = answeredCalls
      ? Math.round(
          calls.filter((c) => c.status === "COMPLETED").reduce((s, c) => s + c.durationSec, 0) /
            answeredCalls
        )
      : 0;

    // Call volume per day
    const callVolume: { date: string; inbound: number; missed: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayCalls = calls.filter((c) => {
        const s = new Date(c.startedAt);
        return s >= d && s < next;
      });
      callVolume.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        inbound: dayCalls.filter((c) => c.status === "COMPLETED").length,
        missed: dayCalls.filter((c) => c.status === "MISSED").length,
      });
    }

    // Booking conversion
    const bookingConversion = apptsBooked
      ? Number(((apptsBooked / Math.max(answeredCalls, 1)) * 100).toFixed(1))
      : 0;

    // Call outcomes
    const outcomeMap = new Map<string, number>();
    for (const c of calls) {
      const key = c.outcome || "Other";
      outcomeMap.set(key, (outcomeMap.get(key) ?? 0) + 1);
    }
    const callOutcomes = Array.from(outcomeMap.entries()).map(([name, value]) => ({ name, value }));

    // Peak call hours
    const hourBuckets = new Array(24).fill(0);
    for (const c of calls) {
      hourBuckets[new Date(c.startedAt).getHours()]++;
    }
    const peakHours = hourBuckets
      .map((count, hour) => ({
        hour: `${hour}:00`,
        calls: count,
      }))
      .filter((h) => h.calls > 0);

    // Agent performance
    const agentMap = new Map<string, { name: string; calls: number; booked: number; transferred: number }>();
    for (const c of calls) {
      const key = c.agentId ?? "unknown";
      const name = "Maya";
      const entry = agentMap.get(key) ?? { name, calls: 0, booked: 0, transferred: 0 };
      entry.calls++;
      if (c.outcome?.includes("Booked")) entry.booked++;
      if (c.transferred) entry.transferred++;
      agentMap.set(key, entry);
    }
    const agentPerformance = Array.from(agentMap.values());

    return ok({
      totalCalls,
      answeredCalls,
      missedCalls,
      transfers,
      apptsBooked,
      apptsCancelled,
      newPatients,
      afterHoursCalls,
      avgCallDuration,
      bookingConversion,
      callVolume,
      callOutcomes,
      peakHours,
      agentPerformance,
    });
  } catch (e) {
    return serverError((e as Error).message);
  }
}