"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart3, Phone, PhoneMissed, Calendar, PhoneForwarded, Clock, UserPlus, Moon,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RANGES = [
  { value: "1", label: "Today" },
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
];

const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

async function fetchAnalytics(range: string) {
  const res = await fetch(`/api/analytics?range=${range}`);
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("7");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => fetchAnalytics(range),
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track call volume, booking conversion, no-shows, after-hours coverage, and Maya's performance.</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                range === r.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[110px] rounded-xl" />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Total Calls" value={data.totalCalls} icon={Phone} />
            <MetricCard label="Answered" value={data.answeredCalls} icon={Phone} />
            <MetricCard label="Missed" value={data.missedCalls} icon={PhoneMissed} />
            <MetricCard label="Transfers" value={data.transfers} icon={PhoneForwarded} />
            <MetricCard label="Appointments" value={data.apptsBooked} icon={Calendar} />
            <MetricCard label="Cancelled" value={data.apptsCancelled} icon={PhoneMissed} />
            <MetricCard label="New Patients" value={data.newPatients} icon={UserPlus} />
            <MetricCard label="After Hours" value={data.afterHoursCalls} icon={Moon} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Call Volume" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.callVolume}>
                  <defs>
                    <linearGradient id="aInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="inbound" stroke="#0ea5e9" fill="url(#aInbound)" strokeWidth={2} />
                  <Area type="monotone" dataKey="missed" stroke="#ef4444" fillOpacity={0} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Call Outcomes" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={data.callOutcomes} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {data.callOutcomes.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Peak Call Hours" icon={Clock}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="calls" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <Card>
              <CardHeader><CardTitle className="text-base">Agent Performance</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {data.agentPerformance.map((a: any, i: number) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.name}</span>
                      <span className="text-sm text-muted-foreground">{a.calls} calls</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-secondary/40 p-2">
                        <p className="font-semibold text-foreground">{a.booked}</p>
                        <p className="text-muted-foreground">Booked</p>
                      </div>
                      <div className="rounded-lg bg-secondary/40 p-2">
                        <p className="font-semibold text-foreground">{a.transferred}</p>
                        <p className="text-muted-foreground">Transferred</p>
                      </div>
                      <div className="rounded-lg bg-secondary/40 p-2">
                        <p className="font-semibold text-foreground">{data.bookingConversion}%</p>
                        <p className="text-muted-foreground">Conversion</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}