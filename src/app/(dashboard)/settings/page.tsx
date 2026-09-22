"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2, Users, Stethoscope, Clock, Calendar, Phone, Bell, Shield,
  CreditCard, Bot, MapPin, Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatPhone, initials, cn } from "@/lib/utils";

const SECTIONS = [
  { id: "clinic", label: "Clinic Profile", icon: Building2 },
  { id: "team", label: "Team Members", icon: Users },
  { id: "dentists", label: "Dentists", icon: Stethoscope },
  { id: "hours", label: "Business Hours", icon: Clock },
  { id: "types", label: "Appointment Types", icon: Calendar },
  { id: "phones", label: "Phone Numbers", icon: Phone },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "ai", label: "AI Settings", icon: Bot },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function fetchSettings() {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export default function SettingsPage() {
  const [active, setActive] = useState("clinic");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your clinic, team, and configuration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <nav className="space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div>
          {isLoading || !data ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <>
              {active === "clinic" && <ClinicProfile clinic={data.clinic} />}
              {active === "team" && <TeamMembers members={data.teamMembers} />}
              {active === "dentists" && <Dentists dentists={data.dentists} />}
              {active === "hours" && <BusinessHours hours={data.businessHours} />}
              {active === "types" && <AppointmentTypes types={data.appointmentTypes} />}
              {active === "phones" && <PhoneNumbers phones={data.phoneNumbers} />}
              {active === "notifications" && <Notifications />}
              {active === "security" && <Security />}
              {active === "billing" && <Billing />}
              {active === "ai" && <AISettings />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ClinicProfile({ clinic }: { clinic: any }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Clinic Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Clinic name" value={clinic?.name} />
          <Field label="Slug" value={clinic?.slug} />
          <Field label="Phone" value={clinic?.phone} />
          <Field label="Email" value={clinic?.email} />
          <Field label="Address" value={clinic?.address} />
          <Field label="City" value={clinic?.city} />
          <Field label="State" value={clinic?.state} />
          <Field label="ZIP" value={clinic?.zip} />
          <Field label="Website" value={clinic?.website} />
          <Field label="Timezone" value={clinic?.timezone} />
        </div>
        <Button>Save changes</Button>
      </CardContent>
    </Card>
  );
}

function TeamMembers({ members }: { members: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Team Members</CardTitle>
        <Button size="sm">Invite</Button>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-4">
            <Avatar className="h-9 w-9"><AvatarFallback>{initials(m.name)}</AvatarFallback></Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.email}</p>
            </div>
            <Badge variant="secondary">{m.role}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Dentists({ dentists }: { dentists: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Dentists</CardTitle>
        <Button size="sm">Add dentist</Button>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {dentists.map((d) => (
          <div key={d.id} className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full" style={{ background: d.color }} />
            <div className="flex-1">
              <p className="text-sm font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.specialty ?? "General"}</p>
            </div>
            <Badge variant="secondary">{d.schedules?.length ?? 0} schedules</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BusinessHours({ hours }: { hours: any[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Business Hours</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {DAYS.map((day, i) => {
          const h = hours.find((x) => x.dayOfWeek === i);
          return (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-sm font-medium">{day}</span>
              {h?.closed ? (
                <Badge variant="secondary">Closed</Badge>
              ) : h ? (
                <span className="text-sm text-muted-foreground">{h.startTime} – {h.endTime}</span>
              ) : (
                <span className="text-sm text-muted-foreground">Not set</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AppointmentTypes({ types }: { types: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Appointment Types</CardTitle>
        <Button size="sm">Add type</Button>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {types.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-4">
            <div className="h-8 w-8 rounded-lg" style={{ background: t.color }} />
            <div className="flex-1">
              <p className="text-sm font-medium">{t.name}</p>
            </div>
            <Badge variant="secondary">{t.durationMin} min</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PhoneNumbers({ phones }: { phones: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Phone Numbers</CardTitle>
        <Button size="sm">Add number</Button>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {phones.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{formatPhone(p.number)}</p>
              <p className="text-xs text-muted-foreground">{p.label ?? "Line"} • {p.provider}</p>
            </div>
            <Badge variant={p.active ? "success" : "secondary"}>{p.active ? "Active" : "Inactive"}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Notifications() {
  const items = [
    { label: "Missed call alerts", desc: "Get notified when a call is missed", on: true },
    { label: "New patient registrations", desc: "Notify when AI registers a new patient", on: true },
    { label: "Call transfers", desc: "Alert when a call is transferred to staff", on: true },
    { label: "Daily summary email", desc: "Receive a daily summary of clinic activity", on: false },
    { label: "After-hours calls", desc: "Notify about calls received after hours", on: true },
  ];
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {items.map((n) => (
          <div key={n.label} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">{n.label}</p>
              <p className="text-xs text-muted-foreground">{n.desc}</p>
            </div>
            <Switch defaultChecked={n.on} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Security() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Security</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">Two-factor authentication</p><p className="text-xs text-muted-foreground">Require 2FA for all team members</p></div>
          <Switch />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">Audit logging</p><p className="text-xs text-muted-foreground">Log all important actions</p></div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">Session timeout</p><p className="text-xs text-muted-foreground">Auto sign-out after 30 minutes</p></div>
          <Switch defaultChecked />
        </div>
        <div className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">
          <Shield className="mb-1 h-4 w-4" />
          This application includes authentication, authorization, tenant isolation, input validation, and audit logging.
          Additional healthcare compliance requirements (e.g. HIPAA) can be implemented on top of this architecture.
          Do not assume compliance solely from the presence of security features.
        </div>
      </CardContent>
    </Card>
  );
}

function Billing() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Billing</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div><p className="font-semibold">Growth Plan</p><p className="text-xs text-muted-foreground">Current plan</p></div>
            <Badge variant="default">Active</Badge>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div><p className="font-semibold">Unlimited</p><p className="text-muted-foreground">Calls</p></div>
            <div><p className="font-semibold">10,000</p><p className="text-muted-foreground">SMS/mo</p></div>
            <div><p className="font-semibold">3</p><p className="text-muted-foreground">Agents</p></div>
          </div>
        </div>
        <Button variant="outline">Manage subscription</Button>
      </CardContent>
    </Card>
  );
}

function AISettings() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">AI Settings</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">Maya active</p><p className="text-xs text-muted-foreground">Maya answers all inbound patient calls</p></div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">After-hours coverage</p><p className="text-xs text-muted-foreground">Maya handles calls outside business hours — nights, weekends, holidays</p></div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">Auto-send confirmations</p><p className="text-xs text-muted-foreground">Send SMS confirmation after booking to reduce no-shows</p></div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div><p className="text-sm font-medium">Conservative emergency mode</p><p className="text-xs text-muted-foreground">Maya never diagnoses — always offers transfer to clinical team</p></div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input defaultValue={value ?? ""} />
    </div>
  );
}