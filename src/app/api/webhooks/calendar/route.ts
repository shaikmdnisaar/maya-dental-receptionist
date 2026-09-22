import { getCalendarProvider } from "@/lib/calendar/provider";
import { ok, serverError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const provider = getCalendarProvider();
    const body = await req.text();
    const payload = JSON.parse(body || "{}");
    // Process calendar event — sync to internal appointments.
    return ok({ received: true, provider: provider.name });
  } catch (e) {
    return serverError((e as Error).message);
  }
}