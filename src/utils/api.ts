import type { NextRequest } from "next/server";
import { z } from "zod";

type Counter = { count: number; reset: number };
const rateStore = new Map<string, Counter>();

export function getClientIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
}

export function rateLimit(
  ip: string,
  key: string,
  max: number = 60,
  windowMs: number = 60_000
): boolean {
  const k = `${ip}:${key}`;
  const now = Date.now();
  const entry = rateStore.get(k);
  if (!entry || entry.reset < now) {
    rateStore.set(k, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  if (entry.count > max) return false;
  return true;
}

export function requireAuthHeaders(req: NextRequest): boolean {
  const userId = req.headers.get("x-user-id");
  const sessionId = req.headers.get("x-session-id");
  return Boolean(userId && sessionId);
}

export async function parseJson<T>(
  req: NextRequest,
  schema?: z.ZodSchema<T>
): Promise<T> {
  const data = await req.json();
  return schema ? schema.parse(data) : (data as T);
}

