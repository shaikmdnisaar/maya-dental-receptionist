"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Search, Phone, Mail, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { formatPhone, relativeTime, initials } from "@/lib/utils";

async function fetchPatients(search: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`/api/patients?${params}`);
  if (!res.ok) throw new Error("Failed to load patients");
  return res.json();
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["patients", search],
    queryFn: () => fetchPatients(search),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your patient CRM — appointments, call history, messages, and insurance info in one place.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="Try a different search or add a new patient." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p: any) => (
            <Link key={p.id} href={`/patients/${p.id}`}>
              <Card className="p-4 transition-colors hover:bg-secondary/30">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials(`${p.firstName} ${p.lastName}`)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{p.firstName} {p.lastName}</p>
                      {p.isNew && <Badge variant="default">New</Badge>}
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{formatPhone(p.phone)}</p>
                      {p.email && <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{p.email}</p>}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {p.appointments?.[0] ? `Last: ${relativeTime(p.appointments[0].startTime)}` : "No visits"}
                      </span>
                      {p.appointments?.[0] && new Date(p.appointments[0].startTime) > new Date() && (
                        <Badge variant="success" className="text-[10px]">Upcoming</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}