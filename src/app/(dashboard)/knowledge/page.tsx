"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen, Plus, Search, Pencil, Trash2, Building2, Stethoscope, Clock,
  Shield, DollarSign, FileText, HelpCircle, AlertTriangle, Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/dashboard/empty-state";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "clinic_info", label: "Clinic Information", icon: Building2 },
  { value: "services", label: "Services", icon: Stethoscope },
  { value: "doctors", label: "Doctors", icon: Stethoscope },
  { value: "hours", label: "Hours", icon: Clock },
  { value: "insurance", label: "Insurance", icon: Shield },
  { value: "pricing", label: "Pricing", icon: DollarSign },
  { value: "policies", label: "Policies", icon: FileText },
  { value: "faqs", label: "FAQs", icon: HelpCircle },
  { value: "emergency", label: "Emergency Instructions", icon: AlertTriangle },
];

async function fetchKnowledge(category: string, search: string) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const res = await fetch(`/api/knowledge?${params}`);
  if (!res.ok) throw new Error("Failed to load knowledge");
  return res.json();
}
async function createKnowledge(data: any) {
  const res = await fetch("/api/knowledge", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}
async function deleteKnowledge(id: string) {
  const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export default function KnowledgePage() {
  const qc = useQueryClient();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "faqs", title: "", content: "", tags: "" });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["knowledge", category, search],
    queryFn: () => fetchKnowledge(category, search),
  });

  const createMut = useMutation({
    mutationFn: createKnowledge,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["knowledge"] }); setOpen(false); setForm({ category: "faqs", title: "", content: "", tags: "" }); },
  });
  const deleteMut = useMutation({
    mutationFn: deleteKnowledge,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["knowledge"] }),
  });

  const submit = () => {
    createMut.mutate({
      category: form.category,
      title: form.title,
      content: form.content,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="mt-1 text-sm text-muted-foreground">Information Maya uses to answer patient questions — clinic hours, services, insurance, pricing, and emergency instructions.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Knowledge
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search knowledge..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState icon={BookOpen} title="No knowledge articles" description="Add clinic info, FAQs, and policies so Maya can answer patient questions accurately." action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add Knowledge</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((doc: any) => {
            const cat = CATEGORIES.find((c) => c.value === doc.category);
            const Icon = cat?.icon ?? Info;
            return (
              <Card key={doc.id} className="group flex flex-col p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{cat?.label ?? doc.category}</Badge>
                  </div>
                  <button
                    onClick={() => deleteMut.mutate(doc.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold">{doc.title}</h3>
                <p className="mt-1 line-clamp-3 flex-1 text-xs text-muted-foreground">{doc.content}</p>
                {doc.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.tags.slice(0, 4).map((t: string) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Knowledge</DialogTitle>
            <DialogDescription>Add information Maya can use to answer patient questions — hours, services, insurance, pricing, policies, FAQs.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. What are your opening hours?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer / Content</label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Mass Dental Clinical is open Monday through Friday from 9 AM to 6 PM..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="hours, schedule" />
            </div>
            <Button onClick={submit} disabled={!form.title || !form.content || createMut.isPending} className="w-full">
              {createMut.isPending ? "Saving..." : "Save Knowledge"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}