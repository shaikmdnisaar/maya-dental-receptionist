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
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calls", href: "/calls", icon: Phone },
  { label: "Calendar", href: "/appointments", icon: Calendar },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Agent", href: "/agent", icon: Bot },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-2 py-1.5 lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}