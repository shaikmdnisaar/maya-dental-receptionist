import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";
import type { DashboardMetrics } from "@/types";

export async function GET() {
  try {
    const ctx = await getTenantContext();
    const clinicId = ctx.clinicId;

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const calls = await prisma.call.findMany({
      where: { clinicId, startedAt: { gte: sevenDaysAgo } },
      orderBy: { startedAt: "desc" },
    });
    const appointments = await prisma.appointment.findMany({
      where: { clinicId, createdAt: { gte: sevenDaysAgo } },
    });
    const patients = await prisma.patient.findMany({ where: { clinicId } });

    const callsAnswered = calls.filter((c) => c.status === "COMPLETED").length;
    const missedCalls = calls.filter((c) => c.status === "MISSED").length;
    const appointmentsBooked = appointments.filter(
      (a) => a.status === "SCHEDULED" || a.status === "CONFIRMED"
    ).length;
    const newPatients = patients.filter((p) => p.isNew).length;
    const avgCallDurationSec = callsAnswered
      ? Math.round(
          calls.filter((c) => c.status === "COMPLETED").reduce((s, c) => s + c.durationSec, 0) /
            callsAnswered
        )
      : 0;
    const transferRate = calls.length
      ? Number(
          ((calls.filter((c) => c.transferred).length / calls.length) * 100).toFixed(1)
        )
      : 0;

    // Calls over time (last 7 days)
    const callsOverTime: DashboardMetrics["callsOverTime"] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayCalls = calls.filter((c) => {
        const s = new Date(c.startedAt);
        return s >= d && s < next;
      });
      callsOverTime.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        answered: dayCalls.filter((c) => c.status === "COMPLETED").length,
        missed: dayCalls.filter((c) => c.status === "MISSED").length,
      });
    }

    // Appointments over time
    const appointmentsOverTime: DashboardMetrics["appointmentsOverTime"] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayAppts = appointments.filter((a) => {
        const s = new Date(a.createdAt);
        return s >= d && s < next;
      });
      appointmentsOverTime.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        booked: dayAppts.length,
        cancelled: dayAppts.filter((a) => a.status === "CANCELLED").length,
      });
    }

    // Call outcomes
    const outcomeMap = new Map<string, number>();
    for (const c of calls) {
      const key = c.outcome || "Other";
      outcomeMap.set(key, (outcomeMap.get(key) ?? 0) + 1);
    }
    const callOutcomes = Array.from(outcomeMap.entries()).map(([name, value]) => ({ name, value }));

    // Patient mix
    const returning = patients.filter((p) => !p.isNew).length;
    const newP = patients.filter((p) => p.isNew).length;
    const patientMix = [
      { name: "Returning", value: returning },
      { name: "New", value: newP },
    ];

    // Live activity (recent calls + appointments)
    const recentCalls = calls.slice(0, 4);
    const liveActivity = recentCalls.map((c) => ({
      id: c.id,
      type: c.transferred ? "transfer" : c.status === "MISSED" ? "missed" : "call",
      text: c.transferred
        ? `Call transferred to reception`
        : c.status === "MISSED"
          ? `Missed call from ${c.patientId ? "a patient" : "unknown"}`
          : `Maya answered a call — ${c.intent ?? "general"}`,
      at: c.startedAt.toISOString(),
    }));

    const metrics: DashboardMetrics = {
      callsAnswered,
      appointmentsBooked,
      missedCalls,
      newPatients,
      avgCallDurationSec,
      transferRate,
      callsOverTime,
      appointmentsOverTime,
      callOutcomes,
      patientMix,
      liveActivity,
    };

    return ok(metrics);
  } catch (e) {
    return serverError((e as Error).message);
  }
}