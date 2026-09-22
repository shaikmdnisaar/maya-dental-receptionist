"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Phone, Mail, User, Calendar, MessageSquare, StickyNote, MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatPhone, relativeTime, initials, formatDuration } from "@/lib/utils";
import Link from "next/link";

async function fetchPatient(id: string) {
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) throw new Error("Failed to load patient");
  return res.json();
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: patient, isLoading, isError, refetch } = useQuery({
    queryKey: ["patient", params.id],
    queryFn: () => fetchPatient(params.id),
    enabled: !!params.id,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !patient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarFallback>{initials(`${patient.firstName} ${patient.lastName}`)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{patient.firstName} {patient.lastName}</h1>
          <div className="flex items-center gap-2">
            {patient.isNew && <Badge variant="default">New patient</Badge>}
            {patient.insurance && <Badge variant="secondary">{patient.insurance}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Patient info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Patient Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={User} label="Name" value={`${patient.firstName} ${patient.lastName}`} />
            <Row icon={Phone} label="Phone" value={formatPhone(patient.phone)} />
            {patient.email && <Row icon={Mail} label="Email" value={patient.email} />}
            {patient.dateOfBirth && <Row icon={Calendar} label="DOB" value={new Date(patient.dateOfBirth).toLocaleDateString()} />}
            {patient.address && <Row icon={MapPin} label="Address" value={`${patient.address}, ${patient.city ?? ""} ${patient.state ?? ""} ${patient.zip ?? ""}`} />}
            {patient.insurance && <Row icon={User} label="Insurance" value={patient.insurance} />}
            {patient.notes && (
              <div className="rounded-lg bg-secondary/40 p-3 text-xs">
                <p className="font-medium">Notes</p>
                <p className="mt-1 text-muted-foreground">{patient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment history */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Appointment History</CardTitle>
            <Link href="/appointments"><Badge variant="outline" className="cursor-pointer">View all →</Badge></Link>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {patient.appointments?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No appointments yet</p>
            ) : (
              patient.appointments?.map((a: any) => (
                <div key={a.id} className="flex items-center gap-4 p-4">
                  <div className="flex w-20 flex-col">
                    <span className="text-sm font-medium">{new Date(a.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className="text-xs text-muted-foreground">{new Date(a.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{a.type?.name ?? "Appointment"}</p>
                    <p className="text-xs text-muted-foreground">{a.dentist?.name}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Call history */}
        <Card>
          <CardHeader><CardTitle className="text-base">Call History</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {patient.calls?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No calls yet</p>
            ) : (
              patient.calls?.map((c: any) => (
                <Link key={c.id} href={`/calls/${c.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-secondary/30">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.intent ?? "General call"}</p>
                    <p className="text-xs text-muted-foreground">{relativeTime(c.startedAt)} • {formatDuration(c.durationSec)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Messages</CardTitle>
            <Link href="/messages"><Badge variant="outline" className="cursor-pointer">Open →</Badge></Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {patient.messages?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet</p>
            ) : (
              patient.messages?.slice(0, 5).map((m: any) => (
                <div key={m.id} className={`rounded-lg px-3 py-2 text-sm ${m.direction === "outbound" ? "bg-primary/5" : "bg-secondary"}`}>
                  <p className="text-xs text-muted-foreground">{m.direction === "outbound" ? "Sent" : "Received"} • {relativeTime(m.createdAt)}</p>
                  <p className="mt-0.5">{m.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
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
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}