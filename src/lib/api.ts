import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function created(data: unknown) {
  return NextResponse.json(data, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function handleZodError(e: unknown) {
  if (e instanceof ZodError) {
    return badRequest(e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  if (e instanceof Error) return badRequest(e.message);
  return serverError();
}

export async function withTenant<T>(
  handler: (clinicId: string) => Promise<T>
): Promise<T> {
  const { getTenantContext } = await import("@/lib/auth/tenant");
  const ctx = await getTenantContext();
  return handler(ctx.clinicId);
}