export const isDemoMode =
  process.env.DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const voiceProvider = process.env.VOICE_PROVIDER || "mock";
export const calendarProvider = process.env.CALENDAR_PROVIDER || "mock";
export const messagingProvider = process.env.MESSAGING_PROVIDER || "mock";

export const config = {
  isDemoMode,
  voiceProvider,
  calendarProvider,
  messagingProvider,
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Maya",
};