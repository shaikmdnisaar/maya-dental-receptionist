"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plug, Phone, Calendar, MessageSquare, Mail, Users, Check, X, Settings as SettingsIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, any> = {
  voice: Phone,
  calendar: Calendar,
  messaging: MessageSquare,
  email: Mail,
  crm: Users,
};

async function fetchIntegrations() {
  const res = await fetch("/api/integrations");
  if (!res.ok) throw new Error("Failed to load integrations");
  return res.json();
}
async function updateIntegration({ integrationId, data }: { integrationId: string; data: any }) {
  const res = await fetch("/api/integrations", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ integrationId, ...data }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export default function IntegrationsPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["integrations"],
    queryFn: fetchIntegrations,
  });

  const mut = useMutation({
    mutationFn: updateIntegration,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] }),
  });

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  // Group by type
  const grouped: Record<string, any[]> = {};
  (data ?? []).forEach((i: any) => {
    if (!grouped[i.type]) grouped[i.type] = [];
    grouped[i.type].push(i);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect voice, calendar, messaging, and CRM providers. Swap providers anytime without changing the dashboard.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        Object.entries(grouped).map(([type, items]) => {
          const Icon = TYPE_ICONS[type] ?? Plug;
          return (
            <div key={type} className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold capitalize text-muted-foreground">
                <Icon className="h-4 w-4" />
                {type}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((i) => (
                  <Card key={i.id} className={cn("p-5", i.connected && "border-success/30")}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          i.connected ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{i.name}</p>
                          <p className="text-xs capitalize text-muted-foreground">{i.provider}</p>
                        </div>
                      </div>
                      {i.connected ? (
                        <Badge variant="success" className="gap-1"><Check className="h-3 w-3" /> Connected</Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1"><X className="h-3 w-3" /> Not connected</Badge>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      {i.connected ? (
                        <>
                          <Button size="sm" variant="outline" className="flex-1">
                            <SettingsIcon className="h-3.5 w-3.5" /> Configure
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => mut.mutate({ integrationId: i.id, data: { connected: false } })}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => mut.mutate({ integrationId: i.id, data: { connected: true } })}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}