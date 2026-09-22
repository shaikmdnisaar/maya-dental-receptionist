"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { cn, formatPhone } from "@/lib/utils";

async function fetchAppointments(filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`/api/appointments?${params}`);
  if (!res.ok) throw new Error("Failed to load appointments");
  return res.json();
}
async function fetchDentists() {
  const res = await fetch("/api/dentists");
  if (!res.ok) throw new Error("Failed to load dentists");
  return res.json();
}
async function fetchPatients() {
  const res = await fetch("/api/patients");
  if (!res.ok) throw new Error("Failed to load patients");
  return res.json();
}
async function fetchTypes() {
  const res = await fetch("/api/appointment-types");
  if (!res.ok) throw new Error("Failed to load types");
  return res.json();
}
async function fetchAvailability(dentistId: string, date: string) {
  const res = await fetch(`/api/availability?dentistId=${dentistId}&date=${date}`);
  if (!res.ok) throw new Error("Failed to load availability");
  return res.json();
}
async function createAppointment(data: any) {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to book");
  }
  return res.json();
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [cursor, setCursor] = useState(new Date());
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: appointments, isLoading, isError, refetch } = useQuery({
    queryKey: ["appointments", dentistFilter, statusFilter, typeFilter],
    queryFn: () =>
      fetchAppointments({
        ...(dentistFilter !== "all" ? { dentistId: dentistFilter } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      }),
  });

  const { data: dentists } = useQuery({ queryKey: ["dentists"], queryFn: fetchDentists });
  const { data: types } = useQuery({ queryKey: ["appt-types"], queryFn: fetchTypes });

  const createMut = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setBookingOpen(false);
    },
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const navigate = (dir: number) => {
    const d = new Date(cursor);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCursor(d);
  };

  const periodLabel = () => {
    if (view === "day") return cursor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (view === "month") return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
    const start = new Date(cursor);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  // Filtered appointments
  const filtered = (appointments ?? []).filter((a: any) => {
    if (typeFilter !== "all" && a.typeId !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage appointments across all dentists — cleanings, consultations, emergencies, and recall visits.</p>
        </div>
        <Button onClick={() => setBookingOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center text-sm font-medium">{periodLabel()}</span>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Select value={dentistFilter} onValueChange={setDentistFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Dentist" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dentists</SelectItem>
              {dentists?.map((d: any) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No-show</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types?.map((t: any) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar / list */}
      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments"
          description="No appointments match your filters for this period."
          action={<Button onClick={() => setBookingOpen(true)}><Plus className="h-4 w-4" />Create Appointment</Button>}
        />
      ) : view === "month" ? (
        <MonthView cursor={cursor} appointments={filtered} />
      ) : view === "day" ? (
        <DayView date={cursor} appointments={filtered} />
      ) : (
        <WeekView cursor={cursor} appointments={filtered} />
      )}

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        dentists={dentists ?? []}
        types={types ?? []}
        onCreate={(data) => createMut.mutate(data)}
        isPending={createMut.isPending}
        error={createMut.error?.message}
      />
    </div>
  );
}

// ----------------------------- Week View -----------------------------

function WeekView({ cursor, appointments }: { cursor: Date; appointments: any[] }) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - start.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {days.map((d) => {
        const dayAppts = appointments.filter((a) => {
          const ad = new Date(a.startTime);
          return ad.toDateString() === d.toDateString();
        });
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <Card key={d.toISOString()} className={cn("min-h-[140px]", isToday && "border-primary/40")}>
            <div className="border-b border-border px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{DAYS[d.getDay()]}</span>
                <span className={cn("text-sm font-semibold", isToday && "text-primary")}>{d.getDate()}</span>
              </div>
            </div>
            <div className="space-y-1.5 p-2">
              {dayAppts.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No appointments</p>
              ) : (
                dayAppts
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((a) => <AppointmentChip key={a.id} appt={a} />)
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ----------------------------- Day View -----------------------------

function DayView({ date, appointments }: { date: Date; appointments: any[] }) {
  const dayAppts = appointments
    .filter((a) => new Date(a.startTime).toDateString() === date.toDateString())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {dayAppts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No appointments today</p>
        ) : (
          dayAppts.map((a) => <AppointmentRow key={a.id} appt={a} />)
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------- Month View -----------------------------

function MonthView({ cursor, appointments }: { cursor: Date; appointments: any[] }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
        {DAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="min-h-[80px] border-b border-r border-border" />;
          const dayAppts = appointments.filter((a) => new Date(a.startTime).toDateString() === d.toDateString());
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div key={i} className={cn("min-h-[80px] border-b border-r border-border p-1.5", isToday && "bg-primary/5")}>
              <span className={cn("text-xs", isToday && "font-bold text-primary")}>{d.getDate()}</span>
              <div className="mt-1 space-y-0.5">
                {dayAppts.slice(0, 3).map((a) => (
                  <div key={a.id} className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">
                    {new Date(a.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} {a.patient?.firstName}
                  </div>
                ))}
                {dayAppts.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">+{dayAppts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ----------------------------- Pieces -----------------------------

function AppointmentChip({ appt }: { appt: any }) {
  return (
    <div
      className="rounded-md px-2 py-1.5 text-xs"
      style={{ background: `${appt.dentist?.color ?? "#0ea5e9"}15`, borderLeft: `2px solid ${appt.dentist?.color ?? "#0ea5e9"}` }}
    >
      <div className="font-medium">
        {new Date(appt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </div>
      <div className="truncate text-muted-foreground">
        {appt.patient?.firstName} {appt.patient?.lastName}
      </div>
      <div className="truncate text-[10px] text-muted-foreground">{appt.type?.name ?? "Appointment"}</div>
    </div>
  );
}

function AppointmentRow({ appt }: { appt: any }) {
  return (
    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/30">
      <div className="flex w-16 flex-col items-center">
        <span className="text-sm font-semibold">
          {new Date(appt.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
        <span className="text-xs text-muted-foreground">{appt.type?.durationMin ?? 30}m</span>
      </div>
      <div className="h-10 w-1 rounded-full" style={{ background: appt.dentist?.color ?? "#0ea5e9" }} />
      <div className="flex-1">
        <p className="font-medium">{appt.patient?.firstName} {appt.patient?.lastName}</p>
        <p className="text-xs text-muted-foreground">{appt.type?.name} • {appt.dentist?.name}</p>
      </div>
      <StatusBadge status={appt.status} />
    </div>
  );
}

// ----------------------------- Booking Dialog -----------------------------

function BookingDialog({
  open, onOpenChange, dentists, types, onCreate, isPending, error,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dentists: any[];
  types: any[];
  onCreate: (data: any) => void;
  isPending: boolean;
  error?: string;
}) {
  const [patientId, setPatientId] = useState("");
  const [dentistId, setDentistId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  const { data: patients } = useQuery({ queryKey: ["patients"], queryFn: fetchPatients, enabled: open });
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["availability", dentistId, date],
    queryFn: () => fetchAvailability(dentistId, date),
    enabled: !!dentistId && !!date,
  });

  const submit = () => {
    if (!patientId || !dentistId || !slot) return;
    const s = slots.find((x: any) => x.startTime === slot);
    onCreate({
      patientId,
      dentistId,
      typeId: typeId || undefined,
      startTime: slot,
      endTime: s?.endTime,
      source: "manual",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Appointment</DialogTitle>
          <DialogDescription>Book a new appointment using live availability.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient</label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>
                {patients?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} — {formatPhone(p.phone)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dentist</label>
              <Select value={dentistId} onValueChange={setDentistId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {dentists.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {types.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlot(""); }} />
          </div>
          {dentistId && date && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Available slots</label>
              {slotsLoading ? (
                <Skeleton className="h-20 rounded-lg" />
              ) : !slots || slots.length === 0 ? (
                <p className="rounded-lg bg-secondary/40 px-3 py-3 text-xs text-muted-foreground">
                  No slots available for this day. Try another date.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s: any) => {
                    const t = new Date(s.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    return (
                      <button
                        key={s.startTime}
                        onClick={() => setSlot(s.startTime)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                          slot === s.startTime
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:bg-secondary"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={submit} disabled={isPending || !patientId || !dentistId || !slot} className="w-full">
            {isPending ? "Booking..." : "Book Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}