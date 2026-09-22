"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MessageSquare, Send, Search, Phone, CheckCircle2, CalendarClock, PhoneForwarded } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import { cn, formatPhone, relativeTime, initials } from "@/lib/utils";

async function fetchConversations() {
  const res = await fetch("/api/messages");
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}
async function sendMessage(data: any) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send");
  return res.json();
}

export default function MessagesPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const { data: conversations, isLoading, isError, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const sendMut = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const selected = conversations?.find((c: any) => c.id === selectedId) ?? conversations?.[0];

  const filtered = (conversations ?? []).filter((c: any) =>
    !search || c.patientName?.toLowerCase().includes(search.toLowerCase()) || c.patientPhone?.includes(search)
  );

  const handleSend = () => {
    if (!draft.trim() || !selected) return;
    sendMut.mutate({ conversationId: selected.id, body: draft, senderKind: "staff" });
    setDraft("");
  };

  const quickReply = (text: string) => {
    if (!selected) return;
    sendMut.mutate({ conversationId: selected.id, body: text, senderKind: "staff" });
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Patient conversations via SMS, WhatsApp, and email — confirmations, reminders, and follow-ups.</p>
      </div>

      <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Conversation list */}
        <Card className="flex flex-col overflow-hidden lg:col-span-1">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="m-2 h-16" />)
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No conversations</p>
            ) : (
              filtered.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-secondary/30",
                    selected?.id === c.id && "bg-primary/5"
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(c.patientName ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{c.patientName}</span>
                      <span className="text-[10px] text-muted-foreground">{relativeTime(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.messages?.[c.messages.length - 1]?.body ?? ""}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">{c.channel}</Badge>
                      {c.unread > 0 && <Badge variant="destructive" className="text-[10px]">{c.unread} new</Badge>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Conversation panel */}
        <Card className="flex flex-col overflow-hidden lg:col-span-2">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={MessageSquare} title="Select a conversation" description="Choose a conversation from the list to view messages." />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9"><AvatarFallback>{initials(selected.patientName ?? "?")}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-medium">{selected.patientName}</p>
                    <p className="text-xs text-muted-foreground">{formatPhone(selected.patientPhone ?? "")}</p>
                  </div>
                </div>
                <Badge variant="secondary">{selected.channel}</Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
                {selected.messages?.map((m: any) => (
                  <div key={m.id} className={cn("flex", m.direction === "outbound" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                        m.direction === "outbound"
                          ? m.senderKind === "agent" ? "bg-primary/10 text-foreground" : "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      )}
                    >
                      {m.senderKind === "agent" && m.direction === "outbound" && (
                        <p className="mb-0.5 text-[10px] font-medium text-primary">Maya (AI)</p>
                      )}
                      {m.senderKind === "staff" && m.direction === "outbound" && (
                        <p className="mb-0.5 text-[10px] font-medium opacity-70">Staff</p>
                      )}
                      <p>{m.body}</p>
                      <p className="mt-0.5 text-[10px] opacity-60">{relativeTime(m.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 border-t border-border p-2">
                <Button size="sm" variant="outline" onClick={() => quickReply("Your appointment is confirmed. See you soon!")}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickReply("Would you like to reschedule? Please suggest a few times that work for you.")}>
                  <CalendarClock className="h-3.5 w-3.5" /> Reschedule
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickReply("This is a reminder for your upcoming appointment at Mass Dental Clinical.")}>
                  Send Reminder
                </Button>
                <Button size="sm" variant="outline" onClick={() => quickReply("I'm transferring you to our reception team who will help shortly.")}>
                  <PhoneForwarded className="h-3.5 w-3.5" /> Transfer to Staff
                </Button>
              </div>

              {/* Composer */}
              <div className="flex items-center gap-2 border-t border-border p-3">
                <Input
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend} disabled={!draft.trim() || sendMut.isPending} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}