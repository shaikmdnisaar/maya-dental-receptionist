import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  COMPLETED: { label: "Completed", variant: "success" },
  ANSWERED: { label: "Answered", variant: "success" },
  MISSED: { label: "Missed", variant: "destructive" },
  TRANSFERRED: { label: "Transferred", variant: "warning" },
  RINGING: { label: "Ringing", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
  VOICEMAIL: { label: "Voicemail", variant: "secondary" },
  SCHEDULED: { label: "Scheduled", variant: "default" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  NO_SHOW: { label: "No-show", variant: "warning" },
  RESCHEDULED: { label: "Rescheduled", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "success" },
  PAUSED: { label: "Paused", variant: "warning" },
  TRAINING: { label: "Training", variant: "default" },
  OFFLINE: { label: "Offline", variant: "secondary" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusMap[status] ?? { label: status, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

export function SentimentBadge({ sentiment }: { sentiment: string | null }) {
  if (!sentiment) return <span className="text-muted-foreground">—</span>;
  const variant =
    sentiment === "Urgent"
      ? "destructive"
      : sentiment === "Needs Staff Review"
        ? "warning"
        : "success";
  return <Badge variant={variant}>{sentiment}</Badge>;
}