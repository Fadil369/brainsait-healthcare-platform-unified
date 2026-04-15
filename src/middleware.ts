import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Generates a secure request ID using crypto.randomUUID when available,
 * falling back to a combination of timestamp and random bytes.
 * While the fallback is not cryptographically ideal, it provides
 * sufficient uniqueness for request correlation purposes.
 */
function generateRequestId(): string {
  // Use crypto.randomUUID if available (standard in modern environments)
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  
  // Fallback: Create a unique ID using available randomness
  // This is sufficient for request correlation but not for security-critical purposes
  const timestamp = Date.now().toString(36);
  const randomPart = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return `${timestamp}-${randomPart}`;
}

// Lightweight, Edge-safe middleware: HTTPS, headers, request ID
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const proto = request.headers.get("x-forwarded-proto");

  // Enforce HTTPS in production behind proxies
  if (process.env.NODE_ENV === "production" && proto === "http") {
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();

  // Baseline security headers (complement Next headers())
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Request correlation id using secure generation
  const rid = generateRequestId();
  response.headers.set("X-Request-ID", rid);
  response.headers.set("X-Security-Checked", "true");

  // Optionally enable strict CSP with per-request nonce
  if (process.env.ENABLE_STRICT_CSP === 'true') {
    const nonce = Math.random().toString(36).slice(2);
    const csp = [
      "default-src 'self'",
      `script-src 'self' https://js.stripe.com 'nonce-${nonce}' 'strict-dynamic'`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.stripe.com https://nphies.sa",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-CSP-Nonce', nonce);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
