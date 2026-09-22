"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Phone,
  PhoneOff,
  Mic,
  User,
  AlertTriangle,
  Download,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDuration, initials } from "@/lib/utils";
import Link from "next/link";
import type { TranscriptSegment } from "@/types";

async function fetchAgent() {
  const res = await fetch("/api/agents");
  if (!res.ok) throw new Error("Failed to load agent");
  const agents = await res.json();
  return agents[0];
}

async function fetchScenarios() {
  const res = await fetch("/api/voice/test");
  if (!res.ok) throw new Error("Failed to load scenarios");
  return res.json();
}

async function startTestCall(agentId: string, scenario: string) {
  const res = await fetch("/api/voice/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, scenario }),
  });
  if (!res.ok) throw new Error("Failed to start test call");
  return res.json();
}

type CallPhase = "idle" | "listening" | "thinking" | "speaking" | "done";

export default function TestConsolePage() {
  const router = useRouter();
  const { data: agent, isLoading: agentLoading, isError: agentErr } = useQuery({
    queryKey: ["agent"],
    queryFn: fetchAgent,
  });
  const { data: scenarios } = useQuery({ queryKey: ["scenarios"], queryFn: fetchScenarios });

  const [scenarioId, setScenarioId] = useState("booking");
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [duration, setDuration] = useState(0);
  const [callInfo, setCallInfo] = useState<any>(null);
  const [scenarioData, setScenarioData] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<{ cancel: () => void } | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const startMut = useMutation({
    mutationFn: () => startTestCall(agent!.id, scenarioId),
    onSuccess: (data) => {
      setCallInfo(data);
      setScenarioData(data.scenario);
      setTranscript([]);
      setDuration(0);
      setPhase("speaking");

      // Start timer
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      // Stream the scenario segments
      const segments = data.scenario.segments as Omit<TranscriptSegment, "ts">[];
      let i = 0;
      let t = 0;
      const next = () => {
        if (i >= segments.length) {
          setPhase("done");
          if (timerRef.current) clearInterval(timerRef.current);
          return;
        }
        const seg = segments[i];
        setPhase(seg.role === "agent" ? "speaking" : seg.role === "system" ? "thinking" : "listening");
        const delay = seg.role === "agent" ? 1400 : seg.role === "system" ? 1000 : 1100;
        setTimeout(() => {
          t += Math.round(delay / 1000);
          setTranscript((prev) => [...prev, { ...seg, ts: t }]);
          i++;
          next();
        }, delay);
      };
      next();
    },
  });

  const endCall = () => {
    streamRef.current?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("done");
  };

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("idle");
    setTranscript([]);
    setDuration(0);
    setCallInfo(null);
    setScenarioData(null);
  };

  if (agentErr) return <ErrorState onRetry={() => router.refresh()} />;
  if (agentLoading || !agent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-32" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  const isCalling = phase !== "idle" && phase !== "done";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Test Maya — AI Receptionist</h1>
          <p className="text-sm text-muted-foreground">
            Run a simulated patient call with Maya — booking, rescheduling, emergency, FAQ, and new patient scenarios. No external credentials needed.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Agent info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot className="h-7 w-7" />
                {phase !== "idle" && phase !== "done" && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success ring-2 ring-card">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-muted-foreground">Dental Receptionist</p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg bg-secondary/40 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={phase === "idle" ? "secondary" : phase === "done" ? "default" : "success"}>
                  {phase === "idle" ? "Ready" : phase === "done" ? "Completed" : "In call"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Voice</span>
                <span className="font-medium">{agent.voice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{agent.language}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-xs">{agent.phoneNumber}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Scenario</label>
              <Select value={scenarioId} onValueChange={setScenarioId} disabled={isCalling}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Center: Call interface */}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col items-center py-10">
            {/* Voice visualizer */}
            <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
              {isCalling && (
                <>
                  <span className="absolute h-32 w-32 animate-pulse-ring rounded-full bg-primary/20" />
                  <span className="absolute h-32 w-32 animate-pulse-ring rounded-full bg-primary/10" style={{ animationDelay: "0.6s" }} />
                </>
              )}
              <div
                className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-colors ${
                  phase === "speaking"
                    ? "bg-primary text-primary-foreground"
                    : phase === "listening"
                      ? "bg-success/20 text-success"
                      : phase === "thinking"
                        ? "bg-warning/20 text-warning"
                        : phase === "done"
                          ? "bg-success text-success-foreground"
                          : "bg-secondary text-muted-foreground"
                }`}
              >
                {phase === "done" ? (
                  <CheckCircle2 className="h-12 w-12" />
                ) : phase === "idle" ? (
                  <Mic className="h-12 w-12" />
                ) : (
                  <Bot className="h-12 w-12" />
                )}
              </div>
            </div>

            {/* Phase label */}
            <div className="mb-2 text-center">
              {phase === "idle" && <p className="text-lg font-medium">Ready to test</p>}
              {phase === "listening" && <p className="text-lg font-medium text-success">Listening...</p>}
              {phase === "thinking" && <p className="text-lg font-medium text-warning">Thinking...</p>}
              {phase === "speaking" && <p className="text-lg font-medium text-primary">Speaking...</p>}
              {phase === "done" && <p className="text-lg font-medium text-success">Call completed</p>}
            </div>

            {/* Waveform during call */}
            {isCalling && (
              <div className="mb-6 flex items-center gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-primary/60 animate-wave"
                    style={{
                      height: "20px",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-3">
              {phase === "idle" && (
                <Button size="lg" onClick={() => startMut.mutate()} disabled={startMut.isPending}>
                  <Phone className="h-5 w-5" />
                  Start Test Call
                </Button>
              )}
              {isCalling && (
                <Button size="lg" variant="destructive" onClick={endCall}>
                  <PhoneOff className="h-5 w-5" />
                  End Call
                </Button>
              )}
              {phase === "done" && (
                <Button size="lg" onClick={reset}>
                  <Sparkles className="h-5 w-5" />
                  New Test Call
                </Button>
              )}
            </div>

            {/* Duration */}
            {(isCalling || phase === "done") && (
              <p className="mt-4 font-mono text-sm text-muted-foreground">{formatDuration(duration)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transcript + call info */}
      {(transcript.length > 0 || phase === "done") && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Transcript */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Conversation</CardTitle>
              <span className="font-mono text-xs text-muted-foreground">{formatDuration(duration)}</span>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 space-y-4 overflow-y-auto scrollbar-thin">
                {transcript.map((seg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 animate-fade-in ${
                      seg.role === "agent" ? "flex-row" : "flex-row-reverse"
                    }`}
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
                      ) : (
                        <span>{scenarioData ? initials(scenarioData.patientName) : "P"}</span>
                      )}
                    </div>
                    <div className={`max-w-[75%] ${seg.role === "agent" ? "" : "text-right"}`}>
                      <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {seg.role === "agent"
                            ? agent.name
                            : seg.role === "system"
                              ? "System"
                              : scenarioData?.patientName ?? "Patient"}
                        </span>
                        <span>{formatDuration(seg.ts)}</span>
                      </div>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          seg.role === "agent"
                            ? "bg-primary/5"
                            : seg.role === "system"
                              ? "bg-warning/10"
                              : "bg-secondary"
                        }`}
                      >
                        {seg.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Call info panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {scenarioData && (
                <>
                  <InfoRow label="Intent" value={scenarioData.intent} />
                  <InfoRow label="Patient" value={scenarioData.patientName} />
                  <InfoRow label="Duration" value={formatDuration(duration)} />
                  <InfoRow label="Outcome" value={scenarioData.outcome} />
                </>
              )}
              {phase === "done" && (
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="rounded-lg bg-success/10 p-3 text-sm">
                    <p className="flex items-center gap-2 font-medium text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      Call completed
                    </p>
                    {scenarioData?.outcome?.includes("Booked") && (
                      <p className="mt-1 text-xs text-foreground">Appointment created</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3.5 w-3.5" />
                      Download Transcript
                    </Button>
                    {scenarioData?.patientName && (
                      <Link href="/patients">
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="h-3.5 w-3.5" />
                          View Patient
                        </Button>
                      </Link>
                    )}
                    {scenarioData?.outcome?.includes("Booked") && (
                      <Link href="/appointments">
                        <Button variant="outline" size="sm" className="w-full">
                          <Calendar className="h-3.5 w-3.5" />
                          View Appointment
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}