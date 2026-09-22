// Messaging provider abstraction.
// Implementations: MockMessagingProvider (default), TwilioMessagingProvider (stub).

export interface OutboundMessage {
  id: string;
  to: string;
  from?: string;
  body: string;
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  status: "queued" | "sent" | "delivered" | "failed";
  createdAt: string;
}

export interface MessagingProvider {
  readonly name: string;
  send(opts: {
    to: string;
    from?: string;
    body: string;
    channel?: "SMS" | "WHATSAPP" | "EMAIL";
  }): Promise<OutboundMessage>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export function getMessagingProvider(): MessagingProvider {
  const provider = (process.env.MESSAGING_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "twilio":
      // return new TwilioMessagingProvider();
      return new MockMessagingProvider();
    default:
      return new MockMessagingProvider();
  }
}

export class MockMessagingProvider implements MessagingProvider {
  readonly name = "mock";

  async send(opts: {
    to: string;
    from?: string;
    body: string;
    channel?: "SMS" | "WHATSAPP" | "EMAIL";
  }): Promise<OutboundMessage> {
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      to: opts.to,
      from: opts.from,
      body: opts.body,
      channel: opts.channel ?? "SMS",
      status: "delivered",
      createdAt: new Date().toISOString(),
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }
}