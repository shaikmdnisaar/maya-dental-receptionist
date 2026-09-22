import { prisma } from "@/lib/db";
import { getTenantContext } from "@/lib/auth/tenant";
import { ok, serverError } from "@/lib/api";

// Aggregated settings — clinic profile, team, dentists, hours, types, phones.
export async function GET() {
  try {
    const ctx = await getTenantContext();
    const [clinic, teamMembers, dentists, businessHours, appointmentTypes, phoneNumbers] =
      await Promise.all([
        prisma.clinic.findUnique({ where: { id: ctx.clinicId } }),
        prisma.teamMember.findMany({ where: { clinicId: ctx.clinicId } }),
        prisma.dentist.findMany({ where: { clinicId: ctx.clinicId }, include: { schedules: true } }),
        prisma.businessHours.findMany({ where: { clinicId: ctx.clinicId }, orderBy: { dayOfWeek: "asc" } }),
        prisma.appointmentType.findMany({ where: { clinicId: ctx.clinicId } }),
        prisma.phoneNumber.findMany({ where: { clinicId: ctx.clinicId } }),
      ]);
    return ok({
      clinic,
      teamMembers,
      dentists,
      businessHours,
      appointmentTypes,
      phoneNumbers,
    });
  } catch (e) {
    return serverError((e as Error).message);
  }
}