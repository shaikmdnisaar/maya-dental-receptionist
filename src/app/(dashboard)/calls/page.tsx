"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Phone, PhoneMissed, PhoneForwarded, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, SentimentBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { formatDuration, formatPhone, relativeTime } from "@/lib/utils";

const TABS = [
  { value: "all", label: "All" },
  { value: "COMPLETED", label: "Answered" },
  { value: "MISSED", label: "Missed" },
  { value: "TRANSFERRED", label: "Transferred" },
  { value: "BOOKED", label: "Booked" },
  { value: "EMERGENCY", label: "Emergency" },
];

async function fetchCalls(status: string, search: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  const res = await fetch(`/api/calls?${params}`);
  if (!res.ok) throw new Error("Failed to load calls");
  return res.json();
}

export default function CallsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["calls", tab, search],
    queryFn: () => fetchCalls(tab, search),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calls</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every patient call — answered, missed, transferred, and booked.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Phone}
          title="No calls found"
          description="Try a different filter or search term."
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/30 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Duration</th>
                  <th className="px-4 py-3 text-left font-medium">Intent</th>
                  <th className="px-4 py-3 text-left font-medium">Outcome</th>
                  <th className="px-4 py-3 text-left font-medium">Agent</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((call: any) => (
                  <tr key={call.id} className="group cursor-pointer transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <Link href={`/calls/${call.id}`} className="font-medium text-foreground group-hover:text-primary">
                        {call.patient ? `${call.patient.firstName} ${call.patient.lastName}` : "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatPhone(call.phoneNumber)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{relativeTime(call.startedAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDuration(call.durationSec)}</td>
                    <td className="px-4 py-3">{call.intent ?? "—"}</td>
                    <td className="px-4 py-3">{call.outcome ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{call.agent?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Link href={`/calls/${call.id}`}>
                        <StatusBadge status={call.status} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {data.map((call: any) => (
              <Link key={call.id} href={`/calls/${call.id}`}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {call.patient ? `${call.patient.firstName} ${call.patient.lastName}` : "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatPhone(call.phoneNumber)}</p>
                    </div>
                    <StatusBadge status={call.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{call.intent ?? "—"}</span>
                    <span>{relativeTime(call.startedAt)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}