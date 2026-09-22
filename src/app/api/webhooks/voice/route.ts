import { getVoiceProvider } from "@/lib/voice/provider";
import { ok, serverError } from "@/lib/api";

// Generic voice webhook — accepts call events from any voice provider.
// In production, verify the signature using the provider's secret.
export async function POST(req: Request) {
  try {
    const provider = getVoiceProvider();
    const body = await req.text();
    const signature = req.headers.get("x-signature") ?? "";
    if (!provider.verifyWebhookSignature(body, signature)) {
      return ok({ error: "Invalid signature" }, 401);
    }
    const payload = JSON.parse(body || "{}");
    // Process call event — store, update status, trigger workflows.
    // The actual handling depends on the provider's event schema.
    return ok({ received: true, event: payload.event ?? "unknown" });
  } catch (e) {
    return serverError((e as Error).message);
  }
}