"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Topbar({ clinicName = "Mass Dental Clinical" }: { clinicName?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md lg:px-6">
      <button
        className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-col sm:flex">
        <span className="text-sm font-semibold">{clinicName}</span>
        <span className="text-[11px] text-muted-foreground">Nashville, TN</span>
      </div>

      <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search patients, calls..." className="pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-xs font-medium">Maya Online</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-medium">Call transferred to reception</span>
              <span className="text-xs text-muted-foreground">Emily Davis — urgent concern</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-medium">New appointment booked</span>
              <span className="text-xs text-muted-foreground">Sarah Johnson — Cleaning</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-2">
              <span className="text-sm font-medium">Missed call</span>
              <span className="text-xs text-muted-foreground">Sophia Martinez — after hours</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-secondary">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Dr. Anika Sharma</span>
                <span className="text-xs font-normal text-muted-foreground">
                  dr.sharma@massdentalclinical.com
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Clinic settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}