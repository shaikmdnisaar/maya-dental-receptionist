import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  dentistId: z.string().min(1),
  typeId: z.string().optional().nullable(),
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
  source: z.string().default("manual"),
});

export const rescheduleAppointmentSchema = z.object({
  startTime: z.string().or(z.date()),
  endTime: z.string().or(z.date()).optional(),
  dentistId: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
    "RESCHEDULED",
  ]),
});

export const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  insurance: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const updateAgentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "PAUSED", "TRAINING", "OFFLINE"]).optional(),
  voice: z.string().optional(),
  language: z.string().optional(),
  phoneNumber: z.string().optional().nullable(),
});

export const updateAgentConfigSchema = z.object({
  greeting: z.string().optional(),
  personality: z.string().optional(),
  responseStyle: z.string().optional(),
  language: z.string().optional(),
  voice: z.string().optional(),
  canBook: z.boolean().optional(),
  canReschedule: z.boolean().optional(),
  canCancel: z.boolean().optional(),
  canAnswerFAQ: z.boolean().optional(),
  canSendSMS: z.boolean().optional(),
  canTransfer: z.boolean().optional(),
  canCollectInfo: z.boolean().optional(),
  afterHoursBehavior: z.string().optional(),
  emergencyHandling: z.string().optional(),
  maxRetryAttempts: z.number().int().min(0).max(10).optional(),
  escalateOnHumanRequest: z.boolean().optional(),
  escalateOnComplaint: z.boolean().optional(),
  escalateOnBilling: z.boolean().optional(),
  escalateOnUnanswered: z.boolean().optional(),
  escalateAfterAttempts: z.number().int().min(1).max(10).optional(),
  transferTarget: z.string().optional(),
});

export const createKnowledgeSchema = z.object({
  category: z.enum([
    "clinic_info",
    "services",
    "doctors",
    "hours",
    "insurance",
    "pricing",
    "policies",
    "faqs",
    "emergency",
  ]),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const updateKnowledgeSchema = createKnowledgeSchema.partial();

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1),
  senderKind: z.enum(["agent", "staff", "system"]).default("staff"),
});

export const createMessageSchema = z.object({
  patientId: z.string().optional().nullable(),
  patientName: z.string().optional().nullable(),
  patientPhone: z.string().optional().nullable(),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL"]).default("SMS"),
  body: z.string().min(1),
});

export const availabilityQuerySchema = z.object({
  dentistId: z.string().min(1),
  date: z.string().min(1),
  durationMin: z.number().int().min(15).max(240).default(30),
});

export const integrationUpdateSchema = z.object({
  connected: z.boolean().optional(),
  config: z.record(z.any()).optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "appointment_reminder",
    "recall",
    "missed_call",
    "new_patient",
    "confirmation",
  ]),
  trigger: z.string().min(1),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL"]).default("SMS"),
  message: z.string().min(1),
  active: z.boolean().default(true),
  agentId: z.string().optional().nullable(),
});

export const voiceTestSchema = z.object({
  agentId: z.string().min(1),
  scenario: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdateAgentConfigInput = z.infer<typeof updateAgentConfigSchema>;
export type CreateKnowledgeInput = z.infer<typeof createKnowledgeSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;