// Voice provider abstraction.
// Implementations: MockVoiceProvider (default), TwilioVoiceProvider,
// RetellVoiceProvider, VapiVoiceProvider (stubs ready for production).

import type { TranscriptSegment } from "@/types";

export interface VoiceCall {
  callId: string;
  status: "ringing" | "answered" | "in_progress" | "ended" | "transferred" | "failed";
  provider: string;
  phoneNumber?: string;
  startedAt: string;
}

export interface VoiceProvider {
  readonly name: string;
  createCall(opts: { to: string; from?: string; agentId: string }): Promise<VoiceCall>;
  endCall(callId: string): Promise<void>;
  getCall(callId: string): Promise<VoiceCall | null>;
  getTranscript(callId: string): Promise<TranscriptSegment[]>;
  transferCall(callId: string, target: string): Promise<void>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export function getVoiceProvider(): VoiceProvider {
  const provider = (process.env.VOICE_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "twilio":
      // return new TwilioVoiceProvider();
      return new MockVoiceProvider();
    case "retell":
      return new MockVoiceProvider();
    case "vapi":
      return new MockVoiceProvider();
    default:
      return new MockVoiceProvider();
  }
}

// ----------------------------- MockVoiceProvider -----------------------------

export class MockVoiceProvider implements VoiceProvider {
  readonly name = "mock";
  private calls = new Map<string, VoiceCall>();
  private transcripts = new Map<string, TranscriptSegment[]>();

  async createCall(opts: { to: string; from?: string; agentId: string }): Promise<VoiceCall> {
    const callId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const call: VoiceCall = {
      callId,
      status: "answered",
      provider: "mock",
      phoneNumber: opts.to,
      startedAt: new Date().toISOString(),
    };
    this.calls.set(callId, call);
    this.transcripts.set(callId, []);
    return call;
  }

  async endCall(callId: string): Promise<void> {
    const c = this.calls.get(callId);
    if (c) {
      c.status = "ended";
      this.calls.set(callId, c);
    }
  }

  async getCall(callId: string): Promise<VoiceCall | null> {
    return this.calls.get(callId) ?? null;
  }

  async getTranscript(callId: string): Promise<TranscriptSegment[]> {
    return this.transcripts.get(callId) ?? [];
  }

  async transferCall(callId: string, target: string): Promise<void> {
    const c = this.calls.get(callId);
    if (c) {
      c.status = "transferred";
      this.calls.set(callId, c);
    }
  }

  verifyWebhookSignature(): boolean {
    return true; // mock accepts all
  }

  // Helper used by the test console to push transcript segments in real time.
  appendSegment(callId: string, segment: TranscriptSegment) {
    const arr = this.transcripts.get(callId) ?? [];
    arr.push(segment);
    this.transcripts.set(callId, arr);
  }
}