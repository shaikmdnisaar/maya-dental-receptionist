import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError, handleZodError } from "@/lib/api";
import { availabilityQuerySchema } from "@/validators";
import { getAvailableSlots } from "@/lib/appointments/service";

export async function GET(req: Request) {
  try {
    await getTenantContext();
    const { searchParams } = new URL(req.url);
    const dentistId = searchParams.get("dentistId");
    const date = searchParams.get("date");
    const durationMin = searchParams.get("durationMin");

    if (!dentistId || !date) {
      return ok([]);
    }
    const data = availabilityQuerySchema.parse({
      dentistId,
      date,
      durationMin: durationMin ? Number(durationMin) : 30,
    });
    const slots = await getAvailableSlots(data);
    return ok(slots);
  } catch (e) {
    return handleZodError(e);
  }
}