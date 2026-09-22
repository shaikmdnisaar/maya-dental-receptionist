import Link from "next/link";
import {
  Sparkles, Phone, Calendar, PhoneForwarded, MessageSquare, BarChart3,
  Bot, Check, Clock, Globe, Shield, PhoneCall, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">Maya</span>
            <span className="ml-1 text-xs text-muted-foreground">by Mass Dental Clinical</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#agents" className="hover:text-foreground">AI Agents</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/dashboard"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <a href="#demo"><Button size="sm">Book a Demo</Button></a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4">AI receptionist for dental practices</Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Your Dental Receptionist,{" "}
                <span className="text-primary">Powered by AI.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Maya answers every patient call, books cleanings and consultations, handles after-hours emergencies, and reduces no-shows — so your front desk can focus on the patients in the chair.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#demo"><Button size="lg">Book a Demo</Button></a>
                <Link href="/agent/test"><Button size="lg" variant="outline"><PhoneCall className="h-4 w-4" />Talk to the AI</Button></Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" />No setup required</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" />Works 24/7</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" />HIPAA-ready architecture</span>
              </div>
            </div>

            {/* Hero visual — dashboard preview */}
            <div className="relative">
              <Card className="overflow-hidden p-0 shadow-xl">
                <div className="border-b border-border bg-secondary/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                    </span>
                    <span className="text-sm font-medium">Maya — Online</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Calls Answered", value: "128" },
                      { label: "Appointments", value: "34" },
                      { label: "New Patients", value: "18" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="mt-1 text-xl font-semibold">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      { t: "Maya answered a call", time: "2m ago" },
                      { t: "Appointment booked — Sarah Johnson", time: "5m ago" },
                      { t: "Call transferred to reception", time: "8m ago" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                        <p className="flex-1 text-xs">{a.t}</p>
                        <span className="text-[10px] text-muted-foreground">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">Features</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything your front desk does — automated.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">From the first ring to the cleaning reminder, Maya handles the repeatable work — booking, FAQs, insurance questions, and follow-ups — so your team can focus on patients in the chair.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Bot, title: "AI Receptionist", desc: "Maya answers every patient call, understands intent — booking, insurance, emergency, FAQ — and takes the right action, 24/7." },
              { icon: Clock, title: "24/7 Call Coverage", desc: "Nights, weekends, holidays. Never send a patient with tooth pain to voicemail again." },
              { icon: Calendar, title: "Appointment Booking", desc: "Live dentist availability, no double bookings. Books cleanings, consultations, and emergency visits straight into your calendar." },
              { icon: PhoneForwarded, title: "Emergency Handoff", desc: "Transfers urgent calls — tooth pain, swelling, trauma — to your clinical team with full context. Never diagnoses." },
              { icon: MessageSquare, title: "Patient Follow-up", desc: "Automated SMS confirmations, cleaning reminders, recall campaigns, and missed-call follow-ups that reduce no-shows." },
              { icon: BarChart3, title: "Analytics", desc: "Track calls, bookings, no-shows, after-hours coverage, and agent performance in real time." },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI team */}
      <section id="agents" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">The AI team</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">One AI team for your dental practice.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Maya covers the calls coming in, the appointments going out, and the patients you need to bring back.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { icon: PhoneCall, title: "Inbound Voice Agent", desc: "Answers every patient call, books cleanings and consultations, captures new patients, handles insurance questions, and routes emergencies to your clinical team." },
              { icon: Calendar, title: "Appointment Agent", desc: "Checks live dentist availability, books, reschedules, and cancels — with SMS confirmations sent automatically to reduce no-shows." },
              { icon: MessageSquare, title: "Recall & Follow-up Agent", desc: "Sends cleaning reminders, follows up on missed calls, re-engages patients due for 6-month recall, and recovers no-shows." },
            ].map((a) => (
              <Card key={a.title} className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <a.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="border-t border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-3">Console</Badge>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Complete visibility. All in one place.</h2>
              <p className="mt-3 text-muted-foreground">See every patient call, every appointment, every conversation. Track no-shows, after-hours coverage, and Maya's performance — catch issues before they become problems.</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Real-time call logs with full transcripts",
                  "Live appointment calendar across all dentists",
                  "Patient CRM with call and message history",
                  "Analytics — call volume, booking conversion, no-show rate",
                  "Knowledge base Maya uses to answer patient questions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="mt-8 inline-block">
                <Button>Explore the dashboard <ChevronRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <Card className="overflow-hidden p-0 shadow-lg">
              <div className="border-b border-border bg-secondary/30 px-4 py-3">
                <span className="text-sm font-medium">Dashboard Preview</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Calls Answered", value: "128" },
                    { label: "Appointments Booked", value: "34" },
                    { label: "Missed Calls", value: "3" },
                    { label: "Transfer Rate", value: "8.4%" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="mt-1 text-xl font-semibold">{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-24 items-end gap-1.5 rounded-lg bg-secondary/30 p-3">
                  {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-primary/40" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="mb-12 text-center">
            <Badge variant="secondary" className="mb-3">FAQ</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions answered.</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Does Maya replace my front desk team?", a: "No. Maya handles repeatable call work — booking cleanings, answering insurance questions, sending reminders — so your team can focus on patients in the chair. Urgent or complex calls transfer to your staff with full context." },
              { q: "Can Maya diagnose dental emergencies?", a: "No. Maya is explicitly designed not to diagnose. For urgent situations — severe tooth pain, swelling, trauma — she follows your clinic-defined escalation instructions and directs callers to appropriate clinical or emergency resources." },
              { q: "What phone providers are supported?", a: "The platform works with Twilio, Retell, and Vapi voice providers. You can switch providers without changing the dashboard. In demo mode, everything works with a mock provider — no credentials needed." },
              { q: "Does it work with my calendar?", a: "Yes. The internal appointment engine works out of the box, and Google Calendar integration is ready to enable. Maya and your front desk share the same scheduling service — no double bookings." },
              { q: "Is it HIPAA-compliant?", a: "The architecture includes authentication, authorization, tenant isolation, audit logging, and input validation. HIPAA compliance requires additional organizational and technical measures — contact us to discuss your compliance needs." },
              { q: "Can I try it without external credentials?", a: "Yes. Demo mode runs the entire application with mock providers — voice, calendar, and messaging — so you can test every feature immediately, including a live AI agent test call." },
            ].map((f) => (
              <Card key={f.q} className="p-5">
                <h3 className="font-medium">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="demo" className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Let your clinic answer every call.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            See Maya in action. Book a demo or test the AI agent right now — no credentials needed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:hello@massdentalclinical.com"><Button size="lg" variant="secondary">Book a Demo</Button></a>
            <Link href="/agent/test"><Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"><PhoneCall className="h-4 w-4" />Talk to the AI</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">Maya</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Mass Dental Clinical. AI receptionist for dental practices.</p>
        </div>
      </footer>
    </div>
  );
}