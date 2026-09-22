// Shared domain types — used by frontend, API, services, and providers.

export type AgentStatus = "ACTIVE" | "PAUSED" | "TRAINING" | "OFFLINE";
export type CallStatus =
  | "RINGING"
  | "ANSWERED"
  | "COMPLETED"
  | "MISSED"
  | "TRANSFERRED"
  | "FAILED"
  | "VOICEMAIL";
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";
export type MessageChannel = "SMS" | "WHATSAPP" | "EMAIL";
export type SentimentLabel = "Routine" | "Urgent" | "Needs Staff Review";

export interface TranscriptSegment {
  role: "agent" | "patient" | "system";
  text: string;
  ts: number; // seconds from call start
  confidence?: number;
}

export interface CallWithRelations {
  id: string;
  clinicId: string;
  agentId: string | null;
  patientId: string | null;
  phoneNumber: string;
  direction: "INBOUND" | "OUTBOUND";
  status: CallStatus;
  intent: string | null;
  outcome: string | null;
  sentiment: SentimentLabel | null;
  durationSec: number;
  startedAt: string;
  endedAt: string | null;
  transferred: boolean;
  transferReason: string | null;
  isAfterHours: boolean;
  recordingUrl: string | null;
  summary: string | null;
  patient?: { id: string; firstName: string; lastName: string; phone: string } | null;
  agent?: { id: string; name: string; voice: string } | null;
  transcript?: TranscriptSegment[] | null;
  appointment?: { id: string; startTime: string } | null;
}

export interface DashboardMetrics {
  callsAnswered: number;
  appointmentsBooked: number;
  missedCalls: number;
  newPatients: number;
  avgCallDurationSec: number;
  transferRate: number;
  callsOverTime: { date: string; answered: number; missed: number }[];
  appointmentsOverTime: { date: string; booked: number; cancelled: number }[];
  callOutcomes: { name: string; value: number }[];
  patientMix: { name: string; value: number }[];
  liveActivity: {
    id: string;
    type: string;
    text: string;
    at: string;
  }[];
}

export interface AvailabilitySlot {
  startTime: string; // ISO
  endTime: string; // ISO
  dentistId: string;
  dentistName: string;
}

export interface AgentToolResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}