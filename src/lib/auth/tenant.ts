// Tenant context — resolves the active clinic for the current request.
// In DEMO_MODE we use the seeded demo clinic. In production this would
// resolve from the authenticated session + organization membership.

import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/config";

export interface TenantContext {
  organizationId: string;
  clinicId: string;
  clinicName: string;
  userId?: string;
}

let cachedDemo: TenantContext | null = null;

export async function getTenantContext(): Promise<TenantContext> {
  if (isDemoMode) {
    if (cachedDemo) return cachedDemo;
    const clinic = await prisma.clinic.findFirst({
      where: { slug: "mass-dental-clinical" },
      include: { organization: true },
    });
    if (!clinic) throw new Error("Demo clinic not seeded");
    cachedDemo = {
      organizationId: clinic.organizationId,
      clinicId: clinic.id,
      clinicName: clinic.name,
    };
    return cachedDemo;
  }

  // Production: resolve from session. Placeholder for Auth.js integration.
  const clinic = await prisma.clinic.findFirst({
    include: { organization: true },
  });
  if (!clinic) throw new Error("No clinic configured");
  return {
    organizationId: clinic.organizationId,
    clinicId: clinic.id,
    clinicName: clinic.name,
  };
}

// Enforce tenant ownership on every query — pass this to where clauses.
export async function tenantWhere(): Promise<{ clinicId: string }> {
  const ctx = await getTenantContext();
  return { clinicId: ctx.clinicId };
}

export async function assertClinicOwnership(clinicId: string): Promise<boolean> {
  const ctx = await getTenantContext();
  return ctx.clinicId === clinicId;
}