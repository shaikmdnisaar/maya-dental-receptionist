import { cn, relativeTime } from "@/lib/utils";
import { Phone, Calendar, PhoneForwarded, AlertTriangle, UserPlus, MessageSquare } from "lucide-react";

interface ActivityItem {
  id: string;
  type: string;
  text: string;
  at: string;
}

const iconMap: Record<string, { icon: typeof Phone; color: string }> = {
  call: { icon: Phone, color: "bg-primary/10 text-primary" },
  transfer: { icon: PhoneForwarded, color: "bg-warning/10 text-warning" },
  missed: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  appointment: { icon: Calendar, color: "bg-success/10 text-success" },
  patient: { icon: UserPlus, color: "bg-primary/10 text-primary" },
  message: { icon: MessageSquare, color: "bg-secondary text-muted-foreground" },
};

export function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => {
        const cfg = iconMap[item.type] ?? iconMap.call;
        const Icon = cfg.icon;
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
          >
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cfg.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="text-sm leading-tight">{item.text}</p>
              <p className="text-xs text-muted-foreground">{relativeTime(item.at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}