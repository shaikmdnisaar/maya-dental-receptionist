// Mock conversation simulator for the voice test console.
// Produces a realistic dental receptionist conversation in DEMO_MODE
// without any external LLM/voice API. Uses scripted scenarios.

import type { TranscriptSegment } from "@/types";

export interface SimScenario {
  id: string;
  label: string;
  intent: string;
  outcome: string;
  patientName: string;
  segments: Omit<TranscriptSegment, "ts">[];
}

export const SCENARIOS: SimScenario[] = [
  {
    id: "booking",
    label: "Book a cleaning",
    intent: "Appointment Booking",
    outcome: "Appointment Booked",
    patientName: "Sarah Johnson",
    segments: [
      { role: "agent", text: "Hi, thank you for calling Mass Dental Clinical. This is Maya, how can I help you today?" },
      { role: "patient", text: "Hi, I need to book a cleaning next week." },
      { role: "agent", text: "Absolutely. What day works best for you?" },
      { role: "patient", text: "Tuesday morning if possible." },
      { role: "agent", text: "I have 9:00 AM or 10:30 AM available with Dr. Sharma. Which would you prefer?" },
      { role: "patient", text: "10:30 sounds great." },
      { role: "agent", text: "Perfect. Can I confirm your name and phone number?" },
      { role: "patient", text: "Sarah Johnson, 555-010-2234." },
      { role: "agent", text: "Thank you, Sarah. I've booked your cleaning with Dr. Sharma on Tuesday at 10:30 AM. You'll get a confirmation text shortly. Is there anything else?" },
      { role: "patient", text: "No, that's all. Thank you!" },
      { role: "agent", text: "You're welcome. Have a great day, Sarah!" },
    ],
  },
  {
    id: "reschedule",
    label: "Reschedule appointment",
    intent: "Reschedule",
    outcome: "Appointment Rescheduled",
    patientName: "Michael Carter",
    segments: [
      { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?" },
      { role: "patient", text: "I need to reschedule my appointment on Friday." },
      { role: "agent", text: "Of course. Could I get your name so I can find your appointment?" },
      { role: "patient", text: "Michael Carter." },
      { role: "agent", text: "Found it — a consultation Friday at 2 PM. When would you like to move it to?" },
      { role: "patient", text: "Next Monday afternoon." },
      { role: "agent", text: "I have 1:00 PM or 3:30 PM Monday with Dr. Mehta. Which works?" },
      { role: "patient", text: "3:30 please." },
      { role: "agent", text: "Done — your consultation is now Monday at 3:30 PM with Dr. Mehta. You'll receive a confirmation text. Anything else?" },
      { role: "patient", text: "No, thanks." },
      { role: "agent", text: "Take care, Michael!" },
    ],
  },
  {
    id: "emergency",
    label: "Tooth pain (urgent)",
    intent: "Urgent / Emergency",
    outcome: "Transferred to Staff",
    patientName: "Emily Davis",
    segments: [
      { role: "agent", text: "Hi, thank you for calling Mass Dental Clinical. This is Maya. How may I help?" },
      { role: "patient", text: "I have severe tooth pain since this morning, I can't wait." },
      { role: "agent", text: "I'm sorry to hear that. I'm not able to diagnose your condition, but I want to make sure you get the right help quickly. Are you available to be transferred to our reception team right now?" },
      { role: "patient", text: "Yes please." },
      { role: "agent", text: "Transferring you now — please stay on the line. If you experience swelling or fever, please consider visiting an emergency dental clinic or calling your local emergency services." },
      { role: "system", text: "Call transferred to reception. Reason: urgent dental concern — patient requested immediate assistance." },
    ],
  },
  {
    id: "hours",
    label: "Ask about hours",
    intent: "FAQ",
    outcome: "Information Provided",
    patientName: "James Wilson",
    segments: [
      { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?" },
      { role: "patient", text: "What are your opening hours?" },
      { role: "agent", text: "We're open Monday through Friday, 9 AM to 6 PM, and Saturdays 9 AM to 1 PM. We're closed on Sundays. Would you like to book an appointment?" },
      { role: "patient", text: "Not right now, thanks." },
      { role: "agent", text: "No problem. Have a wonderful day!" },
    ],
  },
  {
    id: "newpatient",
    label: "New patient registration",
    intent: "New Patient Capture",
    outcome: "Patient Created",
    patientName: "Olivia Brown",
    segments: [
      { role: "agent", text: "Hi, thank you for calling Mass Dental Clinical. This is Maya. How can I help?" },
      { role: "patient", text: "I'm new to the area and I'd like to become a patient." },
      { role: "agent", text: "Welcome! I'd be happy to help you get set up. Can I take your full name and date of birth?" },
      { role: "patient", text: "Olivia Brown, March 14, 1992." },
      { role: "agent", text: "Thank you, Olivia. And the best phone number to reach you?" },
      { role: "patient", text: "555-014-7788." },
      { role: "agent", text: "Perfect. I've created your patient record. Would you like to book your first cleaning today?" },
      { role: "patient", text: "Yes, please." },
      { role: "agent", text: "I have Thursday at 11 AM with Dr. Sharma. Does that work?" },
      { role: "patient", text: "Yes." },
      { role: "agent", text: "Booked! You'll get a confirmation text. Welcome to Mass Dental Clinical, Olivia." },
    ],
  },
];

export function getScenario(id?: string): SimScenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}

// Stream a scenario with timed segments for the test console.
export function streamScenario(
  scenario: SimScenario,
  onSegment: (seg: TranscriptSegment) => void,
  onDone: () => void
): { cancel: () => void } {
  let cancelled = false;
  let i = 0;
  let t = 0;

  const next = () => {
    if (cancelled) return;
    if (i >= scenario.segments.length) {
      onDone();
      return;
    }
    const seg = scenario.segments[i];
    const delay = seg.role === "agent" ? 1200 : 900;
    setTimeout(() => {
      if (cancelled) return;
      t += Math.round(delay / 1000);
      onSegment({ ...seg, ts: t });
      i++;
      next();
    }, delay);
  };

  next();

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}