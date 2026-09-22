import { getMessagingProvider } from "@/lib/messaging/provider";
import { ok, serverError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const provider = getMessagingProvider();
    const body = await req.text();
    const signature = req.headers.get("x-signature") ?? "";
    if (!provider.verifyWebhookSignature(body, signature)) {
      return ok({ error: "Invalid signature" }, 401);
    }
    const payload = JSON.parse(body || "{}");
    // Process inbound message — store, route to conversation, trigger AI reply.
    return ok({ received: true });
  } catch (e) {
    return serverError((e as Error).message);
  }
}