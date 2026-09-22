import { PrismaClient } from "@prisma/client";
import { addDays, addMinutes, setHours, setMinutes, subDays, subHours } from "./seed-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Dental Voice Agent demo data...");

  // ----------------------------- Organization -----------------------------
  const org = await prisma.organization.upsert({
    where: { id: "org_demo" },
    update: {},
    create: {
      id: "org_demo",
      name: "Mass Dental Clinical Group",
      plan: "GROWTH",
    },
  });

  // ----------------------------- Clinic -----------------------------
  const clinic = await prisma.clinic.upsert({
    where: { slug: "mass-dental-clinical" },
    update: {},
    create: {
      id: "clinic_demo",
      organizationId: org.id,
      name: "Mass Dental Clinical",
      slug: "mass-dental-clinical",
      timezone: "America/New_York",
      address: "1200 Broadway, Suite 400",
      city: "Nashville",
      state: "TN",
      zip: "37203",
      phone: "+1 555 100 2000",
      email: "hello@massdentalclinical.com",
      website: "https://massdentalclinical.example.com",
    },
  });

  // ----------------------------- User -----------------------------
  const user = await prisma.user.upsert({
    where: { email: "dr.sharma@massdentalclinical.com" },
    update: {},
    create: {
      id: "user_demo",
      organizationId: org.id,
      email: "dr.sharma@massdentalclinical.com",
      name: "Dr. Anika Sharma",
      role: "OWNER",
      passwordHash: "demo",
    },
  });

  // ----------------------------- Team Members -----------------------------
  await prisma.teamMember.upsert({
    where: { id: "tm_reception" },
    update: {},
    create: {
      id: "tm_reception",
      clinicId: clinic.id,
      userId: user.id,
      name: "Dr. Anika Sharma",
      email: "dr.sharma@massdentalclinical.com",
      role: "OWNER",
    },
  });
  await prisma.teamMember.upsert({
    where: { id: "tm_reception2" },
    update: {},
    create: {
      id: "tm_reception2",
      clinicId: clinic.id,
      name: "Priya Patel",
      email: "priya@massdentalclinical.com",
      role: "RECEPTION",
      phone: "+1 555 100 2010",
    },
  });

  // ----------------------------- Dentists -----------------------------
  const drSharma = await prisma.dentist.upsert({
    where: { id: "dentist_sharma" },
    update: {},
    create: {
      id: "dentist_sharma",
      clinicId: clinic.id,
      name: "Dr. Anika Sharma",
      specialty: "General Dentistry",
      bio: "General and cosmetic dentist with 12 years of experience. Cleanings, fillings, crowns, veneers, and emergency care.",
      email: "dr.sharma@massdentalclinical.com",
      phone: "+1 555 100 2001",
      color: "#0ea5e9",
    },
  });
  const drMehta = await prisma.dentist.upsert({
    where: { id: "dentist_mehta" },
    update: {},
    create: {
      id: "dentist_mehta",
      clinicId: clinic.id,
      name: "Dr. Rahul Mehta",
      specialty: "Orthodontics",
      bio: "Orthodontist specializing in Invisalign clear aligners, traditional braces, and interceptive orthodontics for teens and adults.",
      email: "dr.mehta@massdentalclinical.com",
      phone: "+1 555 100 2002",
      color: "#8b5cf6",
    },
  });

  // Dentist schedules (Mon-Fri 9-6, Sat 9-1)
  for (const d of [1, 2, 3, 4, 5]) {
    await prisma.dentistSchedule.create({
      data: { dentistId: drSharma.id, dayOfWeek: d, startTime: "09:00", endTime: "18:00" },
    });
    await prisma.dentistSchedule.create({
      data: { dentistId: drMehta.id, dayOfWeek: d, startTime: "10:00", endTime: "17:00" },
    });
  }
  await prisma.dentistSchedule.create({
    data: { dentistId: drSharma.id, dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
  });

  // ----------------------------- Business Hours -----------------------------
  for (const d of [1, 2, 3, 4, 5]) {
    await prisma.businessHours.create({
      data: { clinicId: clinic.id, dayOfWeek: d, startTime: "09:00", endTime: "18:00" },
    });
  }
  await prisma.businessHours.create({
    data: { clinicId: clinic.id, dayOfWeek: 6, startTime: "09:00", endTime: "13:00" },
  });
  await prisma.businessHours.create({
    data: { clinicId: clinic.id, dayOfWeek: 0, startTime: "00:00", endTime: "00:00", closed: true },
  });

  // ----------------------------- Appointment Types -----------------------------
  const types = await Promise.all(
    [
      { name: "Cleaning", durationMin: 30, color: "#0ea5e9" },
      { name: "Consultation", durationMin: 30, color: "#22c55e" },
      { name: "Root Canal Consultation", durationMin: 60, color: "#ef4444" },
      { name: "Orthodontic Consultation", durationMin: 45, color: "#8b5cf6" },
      { name: "Follow-up", durationMin: 20, color: "#f59e0b" },
      { name: "Emergency Visit", durationMin: 30, color: "#ec4899" },
    ].map((t) =>
      prisma.appointmentType.create({ data: { clinicId: clinic.id, ...t } })
    )
  );
  const [cleaningType, consultType, rootCanalType, orthoType, followupType, emergencyType] = types;

  // ----------------------------- Phone Number -----------------------------
  await prisma.phoneNumber.upsert({
    where: { number: "+1 555 100 2000" },
    update: {},
    create: {
      id: "phone_main",
      clinicId: clinic.id,
      number: "+1 555 100 2000",
      label: "Main line",
      provider: "mock",
    },
  });

  // ----------------------------- AI Agent -----------------------------
  const agent = await prisma.aIAgent.upsert({
    where: { id: "agent_maya" },
    update: {},
    create: {
      id: "agent_maya",
      clinicId: clinic.id,
      name: "Maya",
      description: "Maya answers patient calls 24/7 — books cleanings and consultations, handles insurance questions, captures new patients, and routes emergencies to your clinical team.",
      status: "ACTIVE",
      voice: "Maya",
      language: "en-US",
      phoneNumber: "+1 555 100 2000",
    },
  });

  await prisma.agentConfig.upsert({
    where: { agentId: agent.id },
    update: {},
    create: {
      agentId: agent.id,
      greeting: "Hi, thank you for calling Mass Dental Clinical. This is Maya, how can I help you today?",
      personality: "Friendly, professional, calm",
      responseStyle: "Concise",
      language: "en-US",
      voice: "Maya",
      canBook: true,
      canReschedule: true,
      canCancel: true,
      canAnswerFAQ: true,
      canSendSMS: true,
      canTransfer: true,
      canCollectInfo: true,
      afterHoursBehavior: "Answer and offer voicemail or next-day booking",
      emergencyHandling: "Never diagnose. Direct to emergency resources and offer transfer to staff.",
      maxRetryAttempts: 2,
      escalateOnHumanRequest: true,
      escalateOnComplaint: true,
      escalateOnBilling: true,
      escalateOnUnanswered: true,
      escalateAfterAttempts: 2,
      transferTarget: "Reception",
    },
  });

  // ----------------------------- Patients -----------------------------
  const patientData = [
    { firstName: "Sarah", lastName: "Johnson", phone: "+1 555 010 2234", email: "sarah.johnson@example.com", isNew: false, insurance: "Delta Dental" },
    { firstName: "Michael", lastName: "Carter", phone: "+1 555 010 5567", email: "m.carter@example.com", isNew: false, insurance: "Cigna" },
    { firstName: "Emily", lastName: "Davis", phone: "+1 555 010 8890", email: "emily.davis@example.com", isNew: false, insurance: "MetLife" },
    { firstName: "James", lastName: "Wilson", phone: "+1 555 012 1145", email: "jwilson@example.com", isNew: true, insurance: "Aetna" },
    { firstName: "Olivia", lastName: "Brown", phone: "+1 555 014 7788", email: "olivia.brown@example.com", isNew: true, insurance: "Guardian" },
    { firstName: "Daniel", lastName: "Lee", phone: "+1 555 017 3322", email: "dlee@example.com", isNew: false, insurance: "Delta Dental" },
    { firstName: "Sophia", lastName: "Martinez", phone: "+1 555 019 9090", email: "sophia.m@example.com", isNew: true, insurance: "Cigna" },
    { firstName: "Robert", lastName: "Taylor", phone: "+1 555 021 4456", email: "rtaylor@example.com", isNew: false, insurance: "MetLife" },
    { firstName: "Ava", lastName: "Nguyen", phone: "+1 555 023 7781", email: "ava.n@example.com", isNew: false, insurance: "Aetna" },
    { firstName: "William", lastName: "Garcia", phone: "+1 555 025 6612", email: "wgarcia@example.com", isNew: true, insurance: "Guardian" },
  ];
  const patients = await Promise.all(
    patientData.map((p) =>
      prisma.patient.create({
        data: {
          clinicId: clinic.id,
          ...p,
          dateOfBirth: new Date(1985 + Math.floor(Math.random() * 20), 0, 1),
          address: "1200 Broadway, Nashville, TN",
        },
      })
    )
  );
  const [sarah, michael, emily, james, olivia, daniel, sophia, robert, ava, william] = patients;

  // ----------------------------- Calls + Transcripts -----------------------------
  const now = new Date();
  const callDefs: Array<{
    patientId: string; agentId: string; status: any; intent: string; outcome: string;
    sentiment: any; durationSec: number; startedAt: Date; transferred: boolean;
    transferReason?: string; isAfterHours: boolean; summary: string;
    transcript: Array<{ role: "agent" | "patient" | "system"; text: string; ts: number }>;
    appointmentIdx?: number;
  }> = [
    {
      patientId: sarah.id, agentId: agent.id, status: "COMPLETED", intent: "Appointment Booking",
      outcome: "Booked", sentiment: "Routine", durationSec: 161, startedAt: subHours(now, 2),
      transferred: false, isAfterHours: false, summary: "Sarah booked a cleaning with Dr. Sharma on Tuesday at 10:30 AM.",
      transcript: [
        { role: "agent", text: "Hi, thank you for calling Mass Dental Clinical. This is Maya, how can I help you today?", ts: 0 },
        { role: "patient", text: "Hi, I need to book a cleaning next week.", ts: 4 },
        { role: "agent", text: "Absolutely. What day works best for you?", ts: 9 },
        { role: "patient", text: "Tuesday morning if possible.", ts: 13 },
        { role: "agent", text: "I have 9:00 AM or 10:30 AM available with Dr. Sharma. Which would you prefer?", ts: 18 },
        { role: "patient", text: "10:30 sounds great.", ts: 23 },
        { role: "agent", text: "Perfect. I've booked your cleaning with Dr. Sharma on Tuesday at 10:30 AM. You'll get a confirmation text shortly.", ts: 28 },
      ],
      appointmentIdx: 0,
    },
    {
      patientId: michael.id, agentId: agent.id, status: "COMPLETED", intent: "Reschedule",
      outcome: "Rescheduled", sentiment: "Routine", durationSec: 142, startedAt: subHours(now, 5),
      transferred: false, isAfterHours: false, summary: "Michael rescheduled his consultation from Friday to Monday 3:30 PM.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?", ts: 0 },
        { role: "patient", text: "I need to reschedule my appointment on Friday.", ts: 3 },
        { role: "agent", text: "Of course. I found your consultation Friday at 2 PM. When would you like to move it to?", ts: 8 },
        { role: "patient", text: "Next Monday afternoon.", ts: 12 },
        { role: "agent", text: "I have 1:00 PM or 3:30 PM Monday with Dr. Mehta. Which works?", ts: 16 },
        { role: "patient", text: "3:30 please.", ts: 20 },
        { role: "agent", text: "Done — your consultation is now Monday at 3:30 PM with Dr. Mehta.", ts: 24 },
      ],
    },
    {
      patientId: emily.id, agentId: agent.id, status: "TRANSFERRED", intent: "Urgent / Emergency",
      outcome: "Transferred to Staff", sentiment: "Urgent", durationSec: 95, startedAt: subHours(now, 8),
      transferred: true, transferReason: "Urgent dental concern — patient requested immediate assistance",
      isAfterHours: false, summary: "Emily reported severe tooth pain. Transferred to reception per emergency protocol.",
      transcript: [
        { role: "agent", text: "Hi, thank you for calling Mass Dental Clinical. This is Maya. How may I help?", ts: 0 },
        { role: "patient", text: "I have severe tooth pain since this morning, I can't wait.", ts: 3 },
        { role: "agent", text: "I'm sorry to hear that. I'm not able to diagnose your condition, but I want to make sure you get the right help quickly. Are you available to be transferred to our reception team right now?", ts: 9 },
        { role: "patient", text: "Yes please.", ts: 14 },
        { role: "agent", text: "Transferring you now — please stay on the line. If you experience swelling or fever, please consider visiting an emergency dental clinic.", ts: 18 },
        { role: "system", text: "Call transferred to reception. Reason: urgent dental concern.", ts: 22 },
      ],
    },
    {
      patientId: james.id, agentId: agent.id, status: "COMPLETED", intent: "FAQ",
      outcome: "Information Provided", sentiment: "Routine", durationSec: 64, startedAt: subHours(now, 26),
      transferred: false, isAfterHours: true, summary: "James asked about opening hours. Provided clinic hours.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?", ts: 0 },
        { role: "patient", text: "What are your opening hours?", ts: 3 },
        { role: "agent", text: "We're open Monday through Friday, 9 AM to 6 PM, and Saturdays 9 AM to 1 PM. We're closed on Sundays.", ts: 7 },
      ],
    },
    {
      patientId: olivia.id, agentId: agent.id, status: "COMPLETED", intent: "New Patient Capture",
      outcome: "Patient Created", sentiment: "Routine", durationSec: 188, startedAt: subHours(now, 30),
      transferred: false, isAfterHours: true, summary: "Olivia registered as a new patient and booked a cleaning Thursday 11 AM.",
      transcript: [
        { role: "agent", text: "Hi, thank you for calling Mass Dental Clinical. This is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I'm new to the area and I'd like to become a patient.", ts: 3 },
        { role: "agent", text: "Welcome! Can I take your full name and date of birth?", ts: 8 },
        { role: "patient", text: "Olivia Brown, March 14, 1992.", ts: 12 },
        { role: "agent", text: "Thank you, Olivia. And the best phone number to reach you?", ts: 17 },
        { role: "patient", text: "555-014-7788.", ts: 21 },
        { role: "agent", text: "Perfect. I've created your patient record and booked your first cleaning Thursday at 11 AM with Dr. Sharma.", ts: 25 },
      ],
      appointmentIdx: 1,
    },
    {
      patientId: daniel.id, agentId: agent.id, status: "COMPLETED", intent: "Appointment Booking",
      outcome: "Booked", sentiment: "Routine", durationSec: 134, startedAt: subHours(now, 33),
      transferred: false, isAfterHours: false, summary: "Daniel booked a follow-up with Dr. Sharma.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?", ts: 0 },
        { role: "patient", text: "I need to book a follow-up.", ts: 3 },
        { role: "agent", text: "Sure — I have Wednesday at 2 PM with Dr. Sharma. Does that work?", ts: 7 },
        { role: "patient", text: "Yes.", ts: 11 },
        { role: "agent", text: "Booked! You'll get a confirmation text.", ts: 14 },
      ],
      appointmentIdx: 2,
    },
    {
      patientId: sophia.id, agentId: agent.id, status: "MISSED", intent: "Unknown",
      outcome: "Missed", sentiment: "Needs Staff Review", durationSec: 0, startedAt: subHours(now, 36),
      transferred: false, isAfterHours: true, summary: "Missed call — no voicemail left. After hours.",
      transcript: [],
    },
    {
      patientId: robert.id, agentId: agent.id, status: "COMPLETED", intent: "Cancellation",
      outcome: "Cancelled", sentiment: "Routine", durationSec: 78, startedAt: subHours(now, 48),
      transferred: false, isAfterHours: false, summary: "Robert cancelled his Friday appointment.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?", ts: 0 },
        { role: "patient", text: "I need to cancel my Friday appointment.", ts: 3 },
        { role: "agent", text: "I've cancelled your appointment. Would you like to reschedule?", ts: 7 },
        { role: "patient", text: "Not right now.", ts: 11 },
      ],
    },
    {
      patientId: ava.id, agentId: agent.id, status: "COMPLETED", intent: "Insurance Question",
      outcome: "Information Provided", sentiment: "Routine", durationSec: 112, startedAt: subHours(now, 52),
      transferred: false, isAfterHours: false, summary: "Ava asked about insurance acceptance. Provided info from knowledge base.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?", ts: 0 },
        { role: "patient", text: "Do you accept Aetna insurance?", ts: 3 },
        { role: "agent", text: "Yes, we accept Aetna. I recommend confirming your specific plan coverage when you arrive.", ts: 7 },
      ],
    },
    {
      patientId: william.id, agentId: agent.id, status: "COMPLETED", intent: "Appointment Booking",
      outcome: "Booked", sentiment: "Routine", durationSec: 156, startedAt: subHours(now, 56),
      transferred: false, isAfterHours: false, summary: "William booked an orthodontic consultation with Dr. Mehta.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya with Mass Dental Clinical. How can I help?", ts: 0 },
        { role: "patient", text: "I'd like an orthodontic consultation.", ts: 3 },
        { role: "agent", text: "I have Friday at 11 AM with Dr. Mehta. Does that work?", ts: 7 },
        { role: "patient", text: "Yes.", ts: 11 },
        { role: "agent", text: "Booked! You'll get a confirmation text.", ts: 14 },
      ],
      appointmentIdx: 3,
    },
    {
      patientId: sarah.id, agentId: agent.id, status: "COMPLETED", intent: "FAQ",
      outcome: "Information Provided", sentiment: "Routine", durationSec: 52, startedAt: subHours(now, 72),
      transferred: false, isAfterHours: false, summary: "Sarah asked about parking. Provided directions.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "Is there parking at the clinic?", ts: 3 },
        { role: "agent", text: "Yes, we have free on-site parking at 1200 Broadway.", ts: 7 },
      ],
    },
    {
      patientId: michael.id, agentId: agent.id, status: "COMPLETED", intent: "Billing Question",
      outcome: "Transferred to Staff", sentiment: "Needs Staff Review", durationSec: 88, startedAt: subHours(now, 76),
      transferred: true, transferReason: "Billing question — escalated per policy",
      isAfterHours: false, summary: "Michael had a billing question. Transferred to reception per escalation rules.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I have a question about my bill.", ts: 3 },
        { role: "agent", text: "I'll transfer you to our reception team who can help with billing.", ts: 7 },
        { role: "system", text: "Transferred to reception. Reason: billing question.", ts: 11 },
      ],
    },
    {
      patientId: emily.id, agentId: agent.id, status: "COMPLETED", intent: "Appointment Booking",
      outcome: "Booked", sentiment: "Routine", durationSec: 144, startedAt: subHours(now, 80),
      transferred: false, isAfterHours: false, summary: "Emily booked an emergency visit follow-up.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I need a follow-up after my emergency visit.", ts: 3 },
        { role: "agent", text: "I have Thursday at 9 AM with Dr. Sharma. Does that work?", ts: 7 },
        { role: "patient", text: "Yes.", ts: 11 },
        { role: "agent", text: "Booked!", ts: 14 },
      ],
      appointmentIdx: 4,
    },
    {
      patientId: daniel.id, agentId: agent.id, status: "MISSED", intent: "Unknown",
      outcome: "Missed", sentiment: "Needs Staff Review", durationSec: 0, startedAt: subHours(now, 84),
      transferred: false, isAfterHours: false, summary: "Missed call during business hours.",
      transcript: [],
    },
    {
      patientId: sophia.id, agentId: agent.id, status: "COMPLETED", intent: "New Patient Capture",
      outcome: "Patient Created", sentiment: "Routine", durationSec: 172, startedAt: subHours(now, 88),
      transferred: false, isAfterHours: false, summary: "Sophia registered as a new patient.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I'm a new patient and want to book.", ts: 3 },
        { role: "agent", text: "Welcome! Can I take your name and phone?", ts: 7 },
        { role: "patient", text: "Sophia Martinez, 555-019-9090.", ts: 11 },
        { role: "agent", text: "Thank you, Sophia. I've created your record and booked a cleaning.", ts: 15 },
      ],
      appointmentIdx: 5,
    },
    {
      patientId: robert.id, agentId: agent.id, status: "COMPLETED", intent: "Reschedule",
      outcome: "Rescheduled", sentiment: "Routine", durationSec: 121, startedAt: subHours(now, 92),
      transferred: false, isAfterHours: false, summary: "Robert rescheduled to next week.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I need to reschedule.", ts: 3 },
        { role: "agent", text: "Sure — I have Wednesday at 4 PM. Does that work?", ts: 7 },
        { role: "patient", text: "Yes.", ts: 11 },
      ],
    },
    {
      patientId: ava.id, agentId: agent.id, status: "COMPLETED", intent: "Appointment Booking",
      outcome: "Booked", sentiment: "Routine", durationSec: 138, startedAt: subHours(now, 96),
      transferred: false, isAfterHours: false, summary: "Ava booked a cleaning.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I'd like to book a cleaning.", ts: 3 },
        { role: "agent", text: "I have Friday at 2 PM with Dr. Sharma.", ts: 7 },
        { role: "patient", text: "Perfect.", ts: 11 },
      ],
      appointmentIdx: 6,
    },
    {
      patientId: william.id, agentId: agent.id, status: "COMPLETED", intent: "FAQ",
      outcome: "Information Provided", sentiment: "Routine", durationSec: 58, startedAt: subHours(now, 100),
      transferred: false, isAfterHours: true, summary: "William asked about services after hours.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "Do you do Invisalign?", ts: 3 },
        { role: "agent", text: "Yes, Dr. Mehta provides Invisalign treatment. Would you like to book a consultation?", ts: 7 },
      ],
    },
    {
      patientId: james.id, agentId: agent.id, status: "COMPLETED", intent: "Appointment Booking",
      outcome: "Booked", sentiment: "Routine", durationSec: 149, startedAt: subHours(now, 104),
      transferred: false, isAfterHours: false, summary: "James booked a consultation.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I'd like a consultation.", ts: 3 },
        { role: "agent", text: "I have Thursday at 4 PM with Dr. Sharma.", ts: 7 },
        { role: "patient", text: "Great.", ts: 11 },
      ],
      appointmentIdx: 7,
    },
    {
      patientId: olivia.id, agentId: agent.id, status: "COMPLETED", intent: "FAQ",
      outcome: "Information Provided", sentiment: "Routine", durationSec: 71, startedAt: subHours(now, 108),
      transferred: false, isAfterHours: false, summary: "Olivia asked about insurance.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "Do you accept Guardian insurance?", ts: 3 },
        { role: "agent", text: "Yes, we accept Guardian.", ts: 7 },
      ],
    },
    {
      patientId: sarah.id, agentId: agent.id, status: "COMPLETED", intent: "Confirm Appointment",
      outcome: "Confirmed", sentiment: "Routine", durationSec: 67, startedAt: subHours(now, 112),
      transferred: false, isAfterHours: false, summary: "Sarah confirmed her Tuesday appointment.",
      transcript: [
        { role: "agent", text: "Hi, this is Maya. How can I help?", ts: 0 },
        { role: "patient", text: "I'm confirming my Tuesday appointment.", ts: 3 },
        { role: "agent", text: "Confirmed — Tuesday at 10:30 AM with Dr. Sharma.", ts: 7 },
      ],
    },
    {
      patientId: michael.id, agentId: agent.id, status: "MISSED", intent: "Unknown",
      outcome: "Missed", sentiment: "Needs Staff Review", durationSec: 0, startedAt: subHours(now, 116),
      transferred: false, isAfterHours: true, summary: "Missed call after hours.",
      transcript: [],
    },
  ];

  for (let i = 0; i < callDefs.length; i++) {
    const c = callDefs[i];
    const call = await prisma.call.create({
      data: {
        clinicId: clinic.id,
        agentId: c.agentId,
        patientId: c.patientId,
        phoneNumber: "+1 555 100 2000",
        direction: "INBOUND",
        status: c.status,
        intent: c.intent,
        outcome: c.outcome,
        sentiment: c.sentiment,
        durationSec: c.durationSec,
        startedAt: c.startedAt,
        endedAt: c.durationSec > 0 ? new Date(c.startedAt.getTime() + c.durationSec * 1000) : null,
        transferred: c.transferred,
        transferReason: c.transferReason,
        isAfterHours: c.isAfterHours,
        summary: c.summary,
      },
    });
    if (c.transcript.length > 0) {
      await prisma.callTranscript.create({
        data: { callId: call.id, segments: JSON.stringify(c.transcript) },
      });
    }
    // Link appointment
    if (c.appointmentIdx !== undefined) {
      const apptDefs = [
        { patient: sarah, dentist: drSharma, type: cleaningType, day: 7, hour: 10, min: 30 },
        { patient: olivia, dentist: drSharma, type: cleaningType, day: 4, hour: 11, min: 0 },
        { patient: daniel, dentist: drSharma, type: followupType, day: 3, hour: 14, min: 0 },
        { patient: william, dentist: drMehta, type: orthoType, day: 5, hour: 11, min: 0 },
        { patient: emily, dentist: drSharma, type: emergencyType, day: 4, hour: 9, min: 0 },
        { patient: sophia, dentist: drSharma, type: cleaningType, day: 6, hour: 13, min: 0 },
        { patient: ava, dentist: drSharma, type: cleaningType, day: 5, hour: 14, min: 0 },
        { patient: james, dentist: drSharma, type: consultType, day: 4, hour: 16, min: 0 },
      ];
      const a = apptDefs[c.appointmentIdx];
      const start = setMinutes(setHours(addDays(now, a.day), a.hour), a.min);
      const appt = await prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: a.patient.id,
          dentistId: a.dentist.id,
          typeId: a.type.id,
          startTime: start,
          endTime: addMinutes(start, a.type.durationMin),
          status: "CONFIRMED",
          source: "voice",
          callId: call.id,
        },
      });
    }
  }

  // A few extra appointments not tied to calls
  await prisma.appointment.create({
    data: {
      clinicId: clinic.id, patientId: robert.id, dentistId: drSharma.id, typeId: cleaningType.id,
      startTime: addDays(setMinutes(setHours(now, 15), 0), 2),
      endTime: addDays(setMinutes(setHours(now, 15), 30), 2),
      status: "SCHEDULED", source: "manual",
    },
  });
  await prisma.appointment.create({
    data: {
      clinicId: clinic.id, patientId: ava.id, dentistId: drMehta.id, typeId: orthoType.id,
      startTime: addDays(setMinutes(setHours(now, 11), 30), 5),
      endTime: addDays(setMinutes(setHours(now, 12), 15), 5),
      status: "SCHEDULED", source: "online",
    },
  });
  await prisma.appointment.create({
    data: {
      clinicId: clinic.id, patientId: daniel.id, dentistId: drSharma.id, typeId: rootCanalType.id,
      startTime: subDays(setMinutes(setHours(now, 9), 0), 3),
      endTime: subDays(setMinutes(setHours(now, 10), 0), 3),
      status: "COMPLETED", source: "manual",
    },
  });
  await prisma.appointment.create({
    data: {
      clinicId: clinic.id, patientId: sophia.id, dentistId: drSharma.id, typeId: cleaningType.id,
      startTime: subDays(setMinutes(setHours(now, 14), 0), 5),
      endTime: subDays(setMinutes(setHours(now, 14), 30), 5),
      status: "NO_SHOW", source: "voice",
    },
  });

  // ----------------------------- Conversations + Messages -----------------------------
  const convo1 = await prisma.conversation.create({
    data: {
      clinicId: clinic.id, patientId: sarah.id, channel: "SMS",
      patientName: "Sarah Johnson", patientPhone: sarah.phone, lastMessageAt: subHours(now, 1),
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo1.id, patientId: sarah.id, channel: "SMS", direction: "outbound", body: "Hi Sarah, this is Mass Dental Clinical. Your cleaning appointment is confirmed for Tuesday at 10:30 AM.", status: "delivered", senderKind: "agent" },
      { conversationId: convo1.id, patientId: sarah.id, channel: "SMS", direction: "inbound", body: "Thank you! See you then.", status: "delivered", senderKind: "system" },
    ],
  });
  const convo2 = await prisma.conversation.create({
    data: {
      clinicId: clinic.id, patientId: michael.id, channel: "SMS",
      patientName: "Michael Carter", patientPhone: michael.phone, lastMessageAt: subHours(now, 4), unread: 1,
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo2.id, patientId: michael.id, channel: "SMS", direction: "outbound", body: "Hi Michael, your consultation has been rescheduled to Monday at 3:30 PM with Dr. Mehta.", status: "delivered", senderKind: "agent" },
      { conversationId: convo2.id, patientId: michael.id, channel: "SMS", direction: "inbound", body: "Can I change it to morning?", status: "delivered", senderKind: "system" },
    ],
  });
  const convo3 = await prisma.conversation.create({
    data: {
      clinicId: clinic.id, patientId: olivia.id, channel: "SMS",
      patientName: "Olivia Brown", patientPhone: olivia.phone, lastMessageAt: subHours(now, 28),
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo3.id, patientId: olivia.id, channel: "SMS", direction: "outbound", body: "Welcome to Mass Dental Clinical, Olivia! Your first cleaning is booked Thursday at 11 AM.", status: "delivered", senderKind: "agent" },
    ],
  });
  const convo4 = await prisma.conversation.create({
    data: {
      clinicId: clinic.id, patientId: william.id, channel: "WHATSAPP",
      patientName: "William Garcia", patientPhone: william.phone, lastMessageAt: subHours(now, 50),
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo4.id, patientId: william.id, channel: "WHATSAPP", direction: "outbound", body: "Hi William, your orthodontic consultation is confirmed for Friday at 11 AM with Dr. Mehta.", status: "delivered", senderKind: "agent" },
    ],
  });

  // ----------------------------- Knowledge Documents -----------------------------
  const knowledge = [
    { category: "clinic_info", title: "About Mass Dental Clinical", content: "Mass Dental Clinical is a modern dental practice in Nashville, TN offering general, cosmetic, and orthodontic care. We are located at 1200 Broadway, Suite 400, Nashville, TN 37203. Free on-site parking is available.", tags: ["about", "location", "parking"] },
    { category: "hours", title: "Opening Hours", content: "Mass Dental Clinical is open Monday through Friday from 9 AM to 6 PM, and Saturdays from 9 AM to 1 PM. We are closed on Sundays and major holidays.", tags: ["hours", "schedule"] },
    { category: "services", title: "Services Offered", content: "We offer cleanings, consultations, root canal consultations, orthodontic consultations, Invisalign, follow-up visits, emergency visits, cosmetic dentistry, and teeth whitening.", tags: ["services", "treatments"] },
    { category: "doctors", title: "Dr. Anika Sharma", content: "Dr. Anika Sharma is a general dentist with 12 years of experience in general and cosmetic dentistry. Available Monday through Friday 9 AM to 6 PM and Saturdays 9 AM to 1 PM.", tags: ["doctor", "sharma", "general"] },
    { category: "doctors", title: "Dr. Rahul Mehta", content: "Dr. Rahul Mehta is an orthodontist specializing in clear aligners and braces, including Invisalign treatment. Available Monday through Friday 10 AM to 5 PM.", tags: ["doctor", "mehta", "orthodontics", "invisalign"] },
    { category: "insurance", title: "Accepted Insurance", content: "We accept most major insurance plans including Delta Dental, Cigna, MetLife, Aetna, and Guardian. Please confirm your specific plan coverage at your visit.", tags: ["insurance", "payment"] },
    { category: "pricing", title: "Pricing", content: "New patient cleaning: $120. Consultation: $90. Orthodontic consultation: $150. Follow-up: $60. Emergency visit: $180. We offer payment plans for major treatments.", tags: ["pricing", "cost"] },
    { category: "policies", title: "Cancellation Policy", content: "Please provide at least 24 hours notice for cancellations or rescheduling. Late cancellations may incur a $25 fee. Emergency visits are exempt.", tags: ["policy", "cancellation"] },
    { category: "faqs", title: "Do you offer payment plans?", content: "Yes, we offer payment plans for major treatments such as orthodontics and root canals. Please ask our reception team for details.", tags: ["faq", "payment"] },
    { category: "faqs", title: "How often should I get a cleaning?", content: "We recommend a professional cleaning every 6 months for most patients. Patients with specific conditions may need more frequent visits.", tags: ["faq", "cleaning"] },
    { category: "emergency", title: "Emergency Instructions", content: "If you experience severe tooth pain, swelling, or trauma, call us immediately. If the clinic is closed and you have a dental emergency, visit the nearest emergency dental clinic or call 911 for life-threatening situations. The AI agent will never diagnose a dental emergency — it will direct you to appropriate resources and offer to transfer you to staff.", tags: ["emergency", "urgent"] },
    { category: "policies", title: "New Patient Registration", content: "New patients should arrive 15 minutes early to complete registration. Please bring a photo ID and your insurance card.", tags: ["policy", "new patient"] },
  ];
  for (const k of knowledge) {
    const doc = await prisma.knowledgeDocument.create({
      data: { clinicId: clinic.id, ...k, tags: JSON.stringify(k.tags) },
    });
    // Simple chunking for future RAG.
    const chunks = k.content.match(/.{1,300}/g) ?? [k.content];
    for (const chunk of chunks) {
      await prisma.knowledgeChunk.create({
        data: { documentId: doc.id, content: chunk, embedding: "[]" },
      });
    }
  }

  // ----------------------------- Integrations -----------------------------
  const integrations = [
    { type: "voice", provider: "mock", name: "Mock Voice", connected: true },
    { type: "voice", provider: "twilio", name: "Twilio Voice", connected: false },
    { type: "voice", provider: "retell", name: "Retell AI", connected: false },
    { type: "voice", provider: "vapi", name: "Vapi", connected: false },
    { type: "calendar", provider: "mock", name: "Internal Calendar", connected: true },
    { type: "calendar", provider: "google", name: "Google Calendar", connected: false },
    { type: "messaging", provider: "mock", name: "Mock Messaging", connected: true },
    { type: "messaging", provider: "twilio", name: "Twilio SMS", connected: false },
    { type: "messaging", provider: "whatsapp", name: "WhatsApp Business", connected: false },
    { type: "email", provider: "smtp", name: "Email (SMTP)", connected: false },
    { type: "crm", provider: "internal", name: "Internal CRM", connected: true },
  ];
  for (const i of integrations) {
    await prisma.integration.create({ data: { clinicId: clinic.id, ...i } });
  }

  // ----------------------------- Campaigns -----------------------------
  await prisma.campaign.create({
    data: {
      clinicId: clinic.id, agentId: agent.id, name: "Appointment Reminders",
      type: "appointment_reminder", trigger: "24 hours before appointment",
      channel: "SMS", message: "Hi {{name}}, this is a reminder for your appointment at Mass Dental Clinical on {{time}}. Reply C to confirm or R to reschedule.", active: true,
    },
  });
  await prisma.campaign.create({
    data: {
      clinicId: clinic.id, agentId: agent.id, name: "Missed Call Follow-up",
      type: "missed_call", trigger: "Patient call missed",
      channel: "SMS", message: "Hi {{name}}, we noticed you tried to reach Mass Dental Clinical. How can we help? Reply or call us back.", active: true,
    },
  });
  await prisma.campaign.create({
    data: {
      clinicId: clinic.id, agentId: agent.id, name: "New Patient Welcome",
      type: "new_patient", trigger: "New patient created",
      channel: "SMS", message: "Welcome to Mass Dental Clinical, {{name}}! We're glad to have you. Need to book an appointment? Just reply here.", active: true,
    },
  });
  await prisma.campaign.create({
    data: {
      clinicId: clinic.id, agentId: agent.id, name: "6-Month Recall",
      type: "recall", trigger: "6 months since last cleaning",
      channel: "SMS", message: "Hi {{name}}, it's time for your 6-month cleaning at Mass Dental Clinical. Reply to book a convenient time.", active: false,
    },
  });

  // ----------------------------- Notifications -----------------------------
  await prisma.notification.createMany({
    data: [
      { clinicId: clinic.id, type: "call.transferred", title: "Call transferred to reception", body: "Emily Davis — urgent dental concern", createdAt: subHours(now, 8) },
      { clinicId: clinic.id, type: "appointment.booked", title: "New appointment booked", body: "Sarah Johnson — Cleaning with Dr. Sharma", createdAt: subHours(now, 2) },
      { clinicId: clinic.id, type: "call.missed", title: "Missed call", body: "Sophia Martinez — after hours", createdAt: subHours(now, 36), read: false },
      { clinicId: clinic.id, type: "patient.new", title: "New patient registered", body: "Olivia Brown registered via voice agent", createdAt: subHours(now, 30), read: false },
    ],
  });

  console.log("✅ Seed complete.");
  console.log(`   Clinic: ${clinic.name} (${clinic.slug})`);
  console.log(`   Agent: ${agent.name}`);
  console.log(`   Patients: ${patients.length}`);
  console.log(`   Calls: ${callDefs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });