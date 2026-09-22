"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Clock,
  User,
  Bot,
  Download,
  Calendar,
  AlertTriangle,
  PhoneForwarded,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, SentimentBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { formatDuration, formatPhone, relativeTime, initials } from "@/lib/utils";
import Link from "next/link";

async function fetchCall(id: string) {
  const res = await fetch(`/api/calls/${id}`);
  if (!res.ok) throw new Error("Failed to load call");
  return res.json();
}

export default function CallDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: call, isLoading, isError, refetch } = useQuery({
    queryKey: ["call", params.id],
    queryFn: () => fetchCall(params.id),
    enabled: !!params.id,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !call) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const transcript = call.transcript?.segments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {call.patient ? `${call.patient.firstName} ${call.patient.lastName}` : "Unknown caller"}
          </h1>
          <p className="text-sm text-muted-foreground">{formatPhone(call.phoneNumber)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={call.status} />
          {call.transferred && (
            <Badge variant="warning" className="gap-1">
              <PhoneForwarded className="h-3 w-3" />
              Transferred
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Call Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={Clock} label="Duration" value={formatDuration(call.durationSec)} />
            <Row icon={Phone} label="Started" value={new Date(call.startedAt).toLocaleString()} />
            <Row icon={Bot} label="Agent" value={call.agent?.name ?? "—"} />
            <Row icon={AlertTriangle} label="Intent" value={call.intent ?? "—"} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sentiment</span>
              <SentimentBadge sentiment={call.sentiment} />
            </div>
            <Row icon={Phone} label="Outcome" value={call.outcome ?? "—"} />
            <Row icon={Clock} label="After hours" value={call.isAfterHours ? "Yes" : "No"} />
            {call.transferReason && (
              <div className="rounded-lg bg-warning/10 p-3 text-xs">
                <p className="font-medium text-warning">Transfer reason</p>
                <p className="mt-1 text-foreground">{call.transferReason}</p>
              </div>
            )}
            {call.summary && (
              <div className="rounded-lg bg-secondary/50 p-3 text-xs">
                <p className="font-medium">Summary</p>
                <p className="mt-1 text-muted-foreground">{call.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Transcript</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </CardHeader>
          <CardContent>
            {transcript.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No transcript available for this call.
              </p>
            ) : (
              <div className="space-y-4">
                {transcript.map((seg: any, i: number) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${seg.role === "agent" ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        seg.role === "agent"
                          ? "bg-primary/10 text-primary"
                          : seg.role === "system"
                            ? "bg-warning/10 text-warning"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {seg.role === "agent" ? (
                        <Bot className="h-4 w-4" />
                      ) : seg.role === "system" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : call.patient ? (
                        initials(`${call.patient.firstName} ${call.patient.lastName}`)
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`max-w-[75%] ${seg.role === "agent" ? "" : "text-right"}`}>
                      <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {seg.role === "agent" ? call.agent?.name ?? "Maya" : seg.role === "system" ? "System" : call.patient ? `${call.patient.firstName}` : "Patient"}
                        </span>
                        <span>{formatDuration(seg.ts)}</span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          seg.role === "agent"
                            ? "bg-primary/5 text-foreground"
                            : seg.role === "system"
                              ? "bg-warning/10 text-foreground"
                              : "bg-secondary text-foreground"
                        }`}
                      >
                        {seg.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Linked records */}
      <div className="grid gap-4 sm:grid-cols-2">
        {call.patient && (
          <Link href={`/patients/${call.patient.id}`}>
            <Card className="p-4 transition-colors hover:bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">View Patient</p>
                  <p className="text-xs text-muted-foreground">
                    {call.patient.firstName} {call.patient.lastName}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}
        {call.appointment && (
          <Link href={`/appointments`}>
            <Card className="p-4 transition-colors hover:bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">View Appointment</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(call.appointment.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}