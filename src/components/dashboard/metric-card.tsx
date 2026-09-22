import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              "mb-1 text-xs font-medium",
              trend.positive ? "text-success" : "text-destructive"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}