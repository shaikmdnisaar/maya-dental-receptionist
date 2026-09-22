"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Phone,
  Calendar,
  Users,
  Bot,
  MessageSquare,
  BarChart3,
  BookOpen,
  Plug,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "Appointments", href: "/appointments", icon: Calendar },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "AI Agent", href: "/agent", icon: Bot },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ clinicName = "Mass Dental Clinical" }: { clinicName?: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Maya</span>
          <span className="text-[11px] text-muted-foreground">{clinicName}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Maya</span>
            <span className="text-[11px] text-success">● Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}