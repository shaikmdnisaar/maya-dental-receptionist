"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  Calendar,
  PhoneMissed,
  UserPlus,
  Clock,
  PhoneForwarded,
  Sparkles,
  Bot,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import type { DashboardMetrics } from "@/types";

const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

async function fetchDashboard(): Promise<DashboardMetrics> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load dashboard"
        description="There was a problem loading your clinic data."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good morning, Dr. Sharma</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Maya is answering patient calls, booking appointments, and handling after-hours coverage for Mass Dental Clinical.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            <span className="text-sm font-medium">Maya — Online</span>
          </div>
          <Link href="/agent/test">
            <Button>
              <Sparkles className="h-4 w-4" />
              Test AI Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))
        ) : (
          <>
            <MetricCard label="Calls Answered" value={data!.callsAnswered} icon={Phone} />
            <MetricCard label="Appointments Booked" value={data!.appointmentsBooked} icon={Calendar} />
            <MetricCard label="Missed Calls" value={data!.missedCalls} icon={PhoneMissed} />
            <MetricCard label="New Patients" value={data!.newPatients} icon={UserPlus} />
            <MetricCard label="Average Call" value={formatDuration(data!.avgCallDurationSec)} icon={Clock} />
            <MetricCard label="Transfer Rate" value={`${data!.transferRate}%`} icon={PhoneForwarded} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[300px] rounded-xl lg:col-span-2" />
            <Skeleton className="h-[300px] rounded-xl" />
          </>
        ) : (
          <>
            <ChartCard title="Calls over time" icon={Phone} className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data!.callsOverTime}>
                  <defs>
                    <linearGradient id="gAnswered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gMissed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Area type="monotone" dataKey="answered" stroke="#0ea5e9" fill="url(#gAnswered)" strokeWidth={2} />
                  <Area type="monotone" dataKey="missed" stroke="#ef4444" fill="url(#gMissed)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Call outcomes" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data!.callOutcomes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data!.callOutcomes.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-2">
                {data!.callOutcomes.map((o, i) => (
                  <Badge key={o.name} variant="secondary" className="gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {o.name} ({o.value})
                  </Badge>
                ))}
              </div>
            </ChartCard>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-[260px] rounded-xl lg:col-span-2" />
            <Skeleton className="h-[260px] rounded-xl" />
          </>
        ) : (
          <>
            <ChartCard title="Appointments booked" icon={Calendar} className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data!.appointmentsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="booked" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="New vs returning" icon={UserPlus}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data!.patientMix}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-4">
                {data!.patientMix.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: i === 0 ? "#0ea5e9" : "#8b5cf6" }} />
                    <span className="text-xs text-muted-foreground">{p.name} ({p.value})</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </>
        )}
      </div>

      {/* Live Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" />
            Live Activity
          </CardTitle>
          <Badge variant="success" className="gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <ActivityFeed items={data!.liveActivity} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}