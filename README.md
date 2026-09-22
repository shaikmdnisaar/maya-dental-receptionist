# Dental Voice Agent

> Your dental receptionist, powered by AI.

A production-ready SaaS web application — an AI-powered voice receptionist and patient communication platform for dental clinics. Inspired by the operational UX of modern AI workforce platforms, but built entirely for dental practices.

## ✨ What it does

- **AI Receptionist (Maya)** — answers inbound calls 24/7, understands patient intent, books appointments, captures new patients, and routes urgent calls to staff.
- **Appointment engine** — one shared scheduling service used by both the frontend and the AI agent. Prevents double booking, respects dentist availability, clinic hours, and buffer time.
- **Patient CRM** — focused on scheduling and communication (not a full EHR).
- **Messaging center** — SMS, WhatsApp, and email with a provider-independent abstraction.
- **Knowledge base** — clinic info, services, doctors, hours, insurance, pricing, policies, FAQs, and emergency instructions. Chunked for future RAG/vector search.
- **Analytics** — call volume, booking conversion, call outcomes, peak hours, agent performance.
- **Human handoff** — configurable escalation rules with context transfer so patients never repeat themselves.
- **Multi-tenant** — Organization → Clinic → Users/Dentists/Patients/AI Agents/Calls/Appointments. Every query enforces tenant ownership.

## 🏗️ Architecture

```
Database model → Service → API → React Query data layer → UI
```

Frontend and backend are tightly integrated from the start. Every UI action has a real API behind it. Where a real external integration isn't configured, a clean provider abstraction and a working mock provider are used — so the app works immediately in DEMO_MODE without external credentials, and real providers can be swapped in without changing the UI.

### Provider abstractions

| Abstraction | Mock (default) | Production-ready stubs |
|---|---|---|
| `VoiceProvider` | `MockVoiceProvider` | Twilio, Retell, Vapi |
| `CalendarProvider` | `MockCalendarProvider` | Google Calendar |
| `MessagingProvider` | `MockMessagingProvider` | Twilio SMS, WhatsApp |

### AI agent tools

The AI calls backend tools instead of touching the DB directly:

`getClinicInfo`, `getBusinessHours`, `searchKnowledge`, `findPatient`, `createPatient`, `getAvailableSlots`, `bookAppointment`, `rescheduleAppointment`, `cancelAppointment`, `sendConfirmation`, `transferToHuman`

## 🧱 Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn-style UI, Lucide icons, Recharts, TanStack Query
- **Backend:** Next.js API routes, TypeScript, Zod validation
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js / NextAuth (session-based tenant context)

## 🚀 Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL (or use the in-memory demo — see below)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — for demo mode, the defaults work out of the box:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dental_voice?schema=public"
DEMO_MODE=true
VOICE_PROVIDER=mock
CALENDAR_PROVIDER=mock
MESSAGING_PROVIDER=mock
```

### 3. Set up the database

```bash
npx prisma migrate dev --name init
npm run db:seed
```

> If you don't have PostgreSQL available yet, you can still explore the landing page at `/` and the UI structure. The dashboard and API routes require the database.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` — marketing landing page
- `/dashboard` — operational dashboard (sign in as Dr. Anika Sharma)
- `/agent/test` — voice agent test console

## 🌱 Demo data

The seed script (`prisma/seed.ts`) creates:

- **Organization:** Mass Dental Clinical Group
- **Clinic:** Mass Dental Clinical (Nashville, TN)
- **Dentists:** Dr. Anika Sharma (General), Dr. Rahul Mehta (Orthodontics)
- **AI Agent:** Maya (active, configured)
- **10 patients** with insurance and history
- **22 calls** with transcripts, outcomes, and sentiments
- **15+ appointments** across dentists and types
- **4 conversations** with messages
- **12 knowledge articles** (chunked for RAG)
- **11 integrations** (voice, calendar, messaging, email, CRM)
- **4 campaigns** (reminders, missed-call follow-up, new patient, recall)
- **Notifications** and audit-ready structure

## 📋 Acceptance test (DEMO_MODE)

All of these work without external API keys:

1. ✅ Sign in → open dashboard
2. ✅ See demo metrics (calls, appointments, missed calls, new patients, avg call, transfer rate)
3. ✅ View AI agent status (Maya — Online)
4. ✅ Test the AI voice agent → simulated conversation streams in real time
5. ✅ Create/book an appointment using live availability
6. ✅ See the appointment in the calendar (day/week/month views)
7. ✅ View the patient profile (appointments, calls, messages)
8. ✅ View a call transcript
9. ✅ See the call in call history with filters
10. ✅ Send a simulated confirmation message
11. ✅ Configure the AI agent (greeting, personality, allowed actions, escalation rules)
12. ✅ Add knowledge articles
13. ✅ View analytics (call volume, outcomes, peak hours, agent performance)
14. ✅ Configure integrations (connect/disconnect providers)

## 🔐 Security & privacy

- Authentication, authorization, and tenant isolation on every query
- Input validation via Zod on every API route
- Webhook signature verification abstraction
- Audit logging model ready
- No secrets exposed to the browser
- Patient data treated as sensitive — role-based access, minimized collection
- The AI **never diagnoses** dental emergencies — it follows clinic-defined escalation instructions

> **Note:** This application includes security features that form a foundation for healthcare compliance, but compliance (e.g. HIPAA) requires additional organizational, legal, and technical measures. Do not assume compliance solely from the presence of these features.

## 📁 Project structure

```
src/
  app/
    (dashboard)/         # App-shell pages (sidebar + topbar)
      dashboard/         # Operational dashboard
      calls/             # Call list + detail
      appointments/      # Calendar + booking
      patients/          # CRM + profiles
      agent/             # AI agent config + test console
      messages/          # Messaging center
      knowledge/         # Knowledge base
      analytics/         # Analytics dashboard
      integrations/      # Provider integrations
      settings/          # Clinic settings
    api/                 # API routes (REST)
      dashboard/ calls/ appointments/ availability/ patients/
      agents/ voice/test messages/ knowledge/ analytics/
      integrations/ campaigns/ notifications/ settings/ dentists/
      appointment-types/ webhooks/{voice,calendar,messages}/
    page.tsx             # Landing page
    layout.tsx           # Root layout + providers
  components/
    ui/                  # shadcn-style primitives
    dashboard/           # Sidebar, Topbar, MetricCard, StatusBadge, etc.
  lib/
    db.ts                # Prisma client
    config.ts            # Demo mode + provider selection
    api.ts               # API response helpers
    auth/tenant.ts       # Tenant context (multi-tenancy)
    voice/               # VoiceProvider + MockVoiceProvider + simulator
    calendar/            # CalendarProvider + MockCalendarProvider
    messaging/           # MessagingProvider + MockMessagingProvider
    appointments/        # Single appointment engine (frontend + AI)
    ai/tools.ts          # AI agent tools
  validators/            # Zod schemas
  types/                 # Shared domain types
prisma/
  schema.prisma          # Multi-tenant data model
  seed.ts                # Demo data
```

## 🔌 Environment variables

See [`.env.example`](.env.example):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret |
| `DEMO_MODE` | `true` = use mock providers + seeded data |
| `VOICE_PROVIDER` | `mock` \| `twilio` \| `retell` \| `vapi` |
| `CALENDAR_PROVIDER` | `mock` \| `google` |
| `MESSAGING_PROVIDER` | `mock` \| `twilio` |
| `TWILIO_*` | Twilio credentials (when enabled) |
| `GOOGLE_CLIENT_*` | Google Calendar credentials (when enabled) |

## 🚢 Deployment

- **Frontend:** Vercel-compatible (Next.js)
- **Database:** Any PostgreSQL-compatible host (Neon, Supabase, RDS, etc.)
- Run `prisma migrate deploy` + `npm run db:seed` on first deploy

## 📄 License

Built as a reference implementation for a dental AI workforce SaaS.