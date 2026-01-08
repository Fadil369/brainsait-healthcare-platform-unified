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

/**
 * Sanitizes a string to prevent XSS attacks by escaping HTML entities.
 * Use this for any user-provided string that will be rendered in HTML.
 */
export function sanitizeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validates and sanitizes a URL to prevent open redirect attacks.
 * Only allows relative URLs or URLs from allowed origins.
 */
export function sanitizeUrl(url: string, allowedOrigins: string[] = []): string | null {
  // Only allow relative URLs by default
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }
  
  try {
    const parsedUrl = new URL(url);
    if (allowedOrigins.includes(parsedUrl.origin)) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  const emailSchema = z.string().email();
  const result = emailSchema.safeParse(email);
  return result.success;
}

/**
 * Sanitizes input for SQL-like queries (use parameterized queries instead when possible).
 * This is a defense-in-depth measure, not a replacement for prepared statements.
 */
export function sanitizeForSearch(input: string): string {
  // Remove or escape potentially dangerous characters
  return input
    .replace(/['"`;\\]/g, '')
    .replace(/--/g, '')
    .trim()
    .slice(0, 200); // Limit length
}

/**
 * Creates a safe error response that doesn't leak sensitive information.
 */
export function createSafeErrorResponse(
  message: string,
  status: number = 500
): Response {
  // Don't expose internal error details in production
  const safeMessage = process.env.NODE_ENV === 'production' 
    ? 'An error occurred. Please try again later.'
    : message;
  
  return new Response(
    JSON.stringify({ 
      error: safeMessage,
      status,
    }),
    { 
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}


