"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bot,
  Phone,
  Globe,
  Smile,
  Clock,
  Settings as SettingsIcon,
  BookOpen,
  PhoneForwarded,
  Plug,
  Pause,
  Pencil,
  Sparkles,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import Link from "next/link";
import { formatPhone } from "@/lib/utils";

async function fetchAgent() {
  const res = await fetch("/api/agents");
  if (!res.ok) throw new Error("Failed to load agent");
  const agents = await res.json();
  return agents[0];
}

async function updateAgent({ agentId, data }: { agentId: string; data: any }) {
  const res = await fetch("/api/agents", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update agent");
  return res.json();
}

async function updateConfig({ agentId, data }: { agentId: string; data: any }) {
  const res = await fetch(`/api/agents/${agentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
}

export default function AgentPage() {
  const { data: agent, isLoading, isError, refetch } = useQuery({
    queryKey: ["agent"],
    queryFn: fetchAgent,
  });

  const [editing, setEditing] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const agentMut = useMutation({ mutationFn: updateAgent, onSuccess: () => refetch() });
  const configMut = useMutation({
    mutationFn: updateConfig,
    onSuccess: () => { refetch(); setEditing(false); },
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !agent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const cfg = config ?? agent.config;
  const isPaused = agent.status === "PAUSED";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Agent — Maya</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure Maya's voice, personality, appointment rules, emergency escalation, and integrations.
        </p>
      </div>

      {/* Agent card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bot className="h-8 w-8" />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success ring-2 ring-card">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{agent.name}</h2>
                <StatusBadge status={agent.status} />
              </div>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {agent.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Voice: {agent.voice}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {agent.language}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {formatPhone(agent.phoneNumber ?? "—")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/agent/test">
              <Button>
                <Sparkles className="h-4 w-4" />
                Test Agent
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              <Pencil className="h-4 w-4" />
              {editing ? "Cancel" : "Edit Agent"}
            </Button>
            <Button
              variant={isPaused ? "default" : "outline"}
              onClick={() =>
                agentMut.mutate({ agentId: agent.id, data: { status: isPaused ? "ACTIVE" : "PAUSED" } })
              }
            >
              <Pause className="h-4 w-4" />
              {isPaused ? "Resume Agent" : "Pause Agent"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard icon={Bot} title="Agent Overview" rows={[
          { label: "Name", value: agent.name },
          { label: "Status", value: agent.status },
          { label: "Phone", value: formatPhone(agent.phoneNumber ?? "—") },
        ]} />
        <InfoCard icon={Sparkles} title="Voice" rows={[
          { label: "Voice", value: agent.voice },
          { label: "Language", value: agent.language },
        ]} />
        <InfoCard icon={Smile} title="Personality" rows={[
          { label: "Style", value: cfg?.personality ?? "—" },
          { label: "Response", value: cfg?.responseStyle ?? "—" },
        ]} />
        <InfoCard icon={Clock} title="Business Hours" rows={[
          { label: "After hours", value: cfg?.afterHoursBehavior ?? "—" },
          { label: "Max retries", value: String(cfg?.maxRetryAttempts ?? 2) },
        ]} />
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="h-4 w-4" />
            Agent Configuration
          </CardTitle>
          {editing && (
            <Button
              size="sm"
              onClick={() => configMut.mutate({ agentId: agent.id, data: config })}
              disabled={configMut.isPending}
            >
              <Save className="h-3.5 w-3.5" />
              {configMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Greeting */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Greeting</label>
            {editing ? (
              <Textarea
                value={cfg?.greeting ?? ""}
                onChange={(e) => setConfig({ ...cfg, greeting: e.target.value })}
                rows={2}
              />
            ) : (
              <p className="rounded-lg bg-secondary/40 px-3 py-2 text-sm">{cfg?.greeting}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Personality</label>
              {editing ? (
                <Input
                  value={cfg?.personality ?? ""}
                  onChange={(e) => setConfig({ ...cfg, personality: e.target.value })}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{cfg?.personality}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Response Style</label>
              {editing ? (
                <Input
                  value={cfg?.responseStyle ?? ""}
                  onChange={(e) => setConfig({ ...cfg, responseStyle: e.target.value })}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{cfg?.responseStyle}</p>
              )}
            </div>
          </div>

          {/* Allowed actions */}
          <div>
            <h4 className="mb-3 text-sm font-medium">Allowed Actions</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "canBook", label: "Book appointments" },
                { key: "canReschedule", label: "Reschedule appointments" },
                { key: "canCancel", label: "Cancel appointments" },
                { key: "canAnswerFAQ", label: "Answer FAQs" },
                { key: "canSendSMS", label: "Send SMS" },
                { key: "canTransfer", label: "Transfer calls" },
                { key: "canCollectInfo", label: "Collect patient information" },
              ].map((action) => (
                <div key={action.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <span className="text-sm">{action.label}</span>
                  <Switch
                    checked={cfg?.[action.key] ?? false}
                    disabled={!editing}
                    onCheckedChange={(v) => setConfig({ ...cfg, [action.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Emergency handling */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Handling</label>
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
              <p className="text-sm text-foreground">{cfg?.emergencyHandling}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                The AI must never diagnose a dental emergency. It follows clinic-defined escalation
                instructions and directs callers to appropriate human/emergency resources.
              </p>
            </div>
          </div>

          {/* Escalation rules */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <PhoneForwarded className="h-4 w-4" />
              Escalation Rules
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "escalateOnHumanRequest", label: "Patient asks for a human" },
                { key: "escalateOnComplaint", label: "Patient has a complaint" },
                { key: "escalateOnBilling", label: "Patient has a billing issue" },
                { key: "escalateOnUnanswered", label: "AI cannot answer after attempts" },
              ].map((rule) => (
                <div key={rule.key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <span className="text-sm">{rule.label}</span>
                  <Switch
                    checked={cfg?.[rule.key] ?? false}
                    disabled={!editing}
                    onCheckedChange={(v) => setConfig({ ...cfg, [rule.key]: v })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Integrations summary */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Plug className="h-4 w-4" />
              Integrations
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Voice: Mock</Badge>
              <Badge variant="success">Calendar: Internal</Badge>
              <Badge variant="success">Messaging: Mock</Badge>
              <Link href="/integrations">
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary">Manage →</Badge>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ icon: Icon, title, rows }: { icon: any; title: string; rows: { label: string; value: string }[] }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="font-medium">{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}