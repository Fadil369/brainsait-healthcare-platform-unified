/**
 * Security Middleware for Healthcare Platform
 * Enterprise-Grade Security Layer with HIPAA & NPHIES Compliance
 */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PerfectSecurityEngine } from "../lib/PerfectSecurity";

interface SecurityContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  route: string;
  method: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  message: string;
}

interface SecurityPolicyConfig {
  enforceHTTPS: boolean;
  requireAuthentication: string[];
  rateLimiting: {
    enabled: boolean;
    configs: Map<string, RateLimitConfig>;
  };
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  geoRestrictions?: {
    allowedCountries: string[];
    blockedCountries: string[];
  };
}

export class SecurityMiddleware {
  private securityEngine: PerfectSecurityEngine;
  private requestCounts: Map<string, { count: number; resetTime: number }> =
    new Map();
  private securityPolicy!: SecurityPolicyConfig; // Initialized in constructor via initializeSecurityPolicy
  private blockedIPs: Set<string> = new Set();
  private suspiciousPatterns: RegExp[] = [];

  constructor() {
    this.securityEngine = PerfectSecurityEngine.getInstance();
    this.initializeSecurityPolicy();
    this.initializeSuspiciousPatterns();
    this.startCleanupTasks();
  }

  /**
   * Main middleware function for Next.js
   */
  async handleRequest(request: NextRequest): Promise<NextResponse> {
    const securityContext = await this.createSecurityContext(request);

    try {
      // Security checks in order of importance
      await this.performSecurityChecks(request, securityContext);

      // Log the request
      await this.logSecureRequest(securityContext, "SUCCESS");

      // Apply security headers
      const response = NextResponse.next();
      this.applySecurityHeaders(response);

      return response;
    } catch (error) {
      await this.logSecureRequest(
        securityContext,
        "BLOCKED",
        error instanceof Error ? error : undefined
      );
      return this.createSecurityResponse(
        error as SecurityError,
        securityContext
      );
    }
  }

  /**
   * Comprehensive security checks
   */
  private async performSecurityChecks(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    // 1. IP-based security checks
    await this.checkIPSecurity(context.ipAddress, context);

    // 2. Rate limiting
    await this.checkRateLimit(request, context);

    // 3. HTTPS enforcement
    this.enforceHTTPS(request);

    // 4. Authentication requirements
    await this.checkAuthenticationRequirements(request, context);

    // 5. Input validation and malicious payload detection
    await this.validateRequestPayload(request, context);

    // 6. Geographic restrictions
    await this.checkGeographicRestrictions(request, context);

    // 7. Healthcare-specific security checks
    await this.performHealthcareSecurityChecks(request, context);
  }

  /**
   * IP-based security checks
   */
  private async checkIPSecurity(
    ipAddress: string,
    context: SecurityContext
  ): Promise<void> {
    // Check if IP is blocked
    if (this.blockedIPs.has(ipAddress)) {
      throw new SecurityError(
        "IP_BLOCKED",
        "IP address has been blocked due to security violations",
        "CRITICAL"
      );
    }

    // Check IP whitelist (if configured)
    if (
      this.securityPolicy.ipWhitelist &&
      this.securityPolicy.ipWhitelist.length > 0
    ) {
      if (!this.securityPolicy.ipWhitelist.includes(ipAddress)) {
        throw new SecurityError(
          "IP_NOT_WHITELISTED",
          "IP address is not in whitelist",
          "HIGH"
        );
      }
    }

    // Check IP blacklist
    if (this.securityPolicy.ipBlacklist?.includes(ipAddress)) {
      throw new SecurityError(
        "IP_BLACKLISTED",
        "IP address is blacklisted",
        "HIGH"
      );
    }

    // Check for suspicious IP patterns (multiple rapid requests, etc.)
    await this.detectSuspiciousIPActivity(ipAddress, context);
  }

  /**
   * Rate limiting implementation
   */
  private async checkRateLimit(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    if (!this.securityPolicy.rateLimiting.enabled) return;

    const route = context.route;
    const rateLimitConfig =
      this.securityPolicy.rateLimiting.configs.get(route) ||
      this.securityPolicy.rateLimiting.configs.get("default");

    if (!rateLimitConfig) return;

    const key = `${context.ipAddress}:${route}`;
    const now = Date.now();
    const windowStart = now - rateLimitConfig.windowMs;

    let requestData = this.requestCounts.get(key);

    if (!requestData || requestData.resetTime < windowStart) {
      requestData = { count: 0, resetTime: now + rateLimitConfig.windowMs };
    }

    requestData.count++;
    this.requestCounts.set(key, requestData);

    if (requestData.count > rateLimitConfig.maxRequests) {
      // Block IP for repeated violations
      if (requestData.count > rateLimitConfig.maxRequests * 2) {
        this.blockedIPs.add(context.ipAddress);
        await this.securityEngine.logAccess(
          "IP_AUTO_BLOCKED",
          "SUCCESS",
          context.userId,
          context.sessionId,
          { ipAddress: context.ipAddress, violations: requestData.count },
          "CRITICAL",
          "RATE_LIMITING"
        );
      }

      throw new SecurityError(
        "RATE_LIMIT_EXCEEDED",
        rateLimitConfig.message,
        "HIGH"
      );
    }
  }

  /**
   * HTTPS enforcement
   */
  private enforceHTTPS(request: NextRequest): void {
    if (
      this.securityPolicy.enforceHTTPS &&
      request.nextUrl.protocol !== "https:"
    ) {
      throw new SecurityError(
        "HTTPS_REQUIRED",
        "HTTPS is required for all healthcare data transmissions",
        "HIGH"
      );
    }
  }

  /**
   * Authentication requirements check
   */
  private async checkAuthenticationRequirements(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    const route = context.route;
    const requiresAuth = this.securityPolicy.requireAuthentication.some(
      (pattern) => route.match(new RegExp(pattern))
    );

    if (requiresAuth) {
      const authHeader = request.headers.get("authorization");
      const sessionHeader = request.headers.get("x-session-id");

      if (!authHeader || !sessionHeader) {
        throw new SecurityError(
          "AUTHENTICATION_REQUIRED",
          "Authentication required for this resource",
          "HIGH"
        );
      }

      // Validate session with security engine
      const isValid = await this.validateSession(sessionHeader, context);
      if (!isValid) {
        throw new SecurityError(
          "INVALID_SESSION",
          "Session is invalid or expired",
          "HIGH"
        );
      }
    }
  }

  /**
   * Request payload validation
   */
  private async validateRequestPayload(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    if (
      request.method === "POST" ||
      request.method === "PUT" ||
      request.method === "PATCH"
    ) {
      try {
        const body = await request.text();

        // Check for malicious patterns
        for (const pattern of this.suspiciousPatterns) {
          if (pattern.test(body)) {
            throw new SecurityError(
              "MALICIOUS_PAYLOAD",
              "Malicious payload detected",
              "CRITICAL"
            );
          }
        }

        // Check for potential PHI in unencrypted form
        if (this.containsUnencryptedPHI(body)) {
          throw new SecurityError(
            "UNENCRYPTED_PHI",
            "Unencrypted PHI detected in request payload",
            "CRITICAL"
          );
        }

        // Validate JSON structure if applicable
        if (request.headers.get("content-type")?.includes("application/json")) {
          try {
            JSON.parse(body);
          } catch {
            throw new SecurityError(
              "INVALID_JSON",
              "Invalid JSON payload",
              "MEDIUM"
            );
          }
        }
      } catch (error) {
        if (error instanceof SecurityError) throw error;
        // If we can't read the body, it might be a stream - log but don't block
        await this.securityEngine.logAccess(
          "PAYLOAD_VALIDATION_WARNING",
          "WARNING",
          context.userId,
          context.sessionId,
          { error: "Could not validate request payload" },
          "MEDIUM"
        );
      }
    }
  }

  /**
   * Geographic restrictions
   */
  private async checkGeographicRestrictions(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    if (!this.securityPolicy.geoRestrictions) return;

    // Get country from IP (simplified - in production, use a proper GeoIP service)
    const country = await this.getCountryFromIP(context.ipAddress);

    if (
      this.securityPolicy.geoRestrictions.blockedCountries.includes(country)
    ) {
      throw new SecurityError(
        "GEO_BLOCKED",
        `Access from ${country} is not permitted`,
        "HIGH"
      );
    }

    if (
      this.securityPolicy.geoRestrictions.allowedCountries.length > 0 &&
      !this.securityPolicy.geoRestrictions.allowedCountries.includes(country)
    ) {
      throw new SecurityError(
        "GEO_RESTRICTED",
        `Access from ${country} is restricted`,
        "HIGH"
      );
    }
  }

  /**
   * Healthcare-specific security checks
   */
  private async performHealthcareSecurityChecks(
    request: NextRequest,
    context: SecurityContext
  ): Promise<void> {
    const route = context.route;

    // Check for healthcare data endpoints
    if (this.isHealthcareDataEndpoint(route)) {
      // Ensure additional security measures for healthcare data
      const mfaHeader = request.headers.get("x-mfa-verified");
      if (!mfaHeader || mfaHeader !== "true") {
        throw new SecurityError(
          "MFA_REQUIRED",
          "Multi-factor authentication required for healthcare data access",
          "HIGH"
        );
      }

      // Check for HIPAA compliance headers
      const hipaaHeader = request.headers.get("x-hipaa-compliant");
      if (!hipaaHeader || hipaaHeader !== "true") {
        throw new SecurityError(
          "HIPAA_COMPLIANCE_REQUIRED",
          "HIPAA compliance verification required",
          "HIGH"
        );
      }
    }

    // Check for NPHIES integration endpoints
    if (this.isNPHIESEndpoint(route)) {
      const nphiesHeader = request.headers.get("x-nphies-token");
      if (!nphiesHeader) {
        throw new SecurityError(
          "NPHIES_AUTH_REQUIRED",
          "NPHIES authentication token required",
          "HIGH"
        );
      }
    }
  }

  /**
   * Apply security headers to response
   */
  private applySecurityHeaders(response: NextResponse): void {
    const securityHeaders = this.securityEngine.getSecurityHeaders();

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add additional middleware-specific headers
    response.headers.set("X-Request-ID", crypto.randomUUID());
    response.headers.set("X-Security-Checked", "true");
    response.headers.set("X-Compliance-Level", "ENTERPRISE");
  }

  /**
   * Create security context from request
   */
  private async createSecurityContext(
    request: NextRequest
  ): Promise<SecurityContext> {
    return {
      requestId: crypto.randomUUID(),
      userId: request.headers.get("x-user-id") || undefined,
      sessionId: request.headers.get("x-session-id") || undefined,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || "Unknown",
      timestamp: new Date(),
      route: request.nextUrl.pathname,
      method: request.method,
      riskLevel: "LOW", // Will be updated based on checks
    };
  }

  /**
   * Initialize security policy
   */
  private initializeSecurityPolicy(): void {
    this.securityPolicy = {
      enforceHTTPS: true,
      requireAuthentication: [
        "/api/patients/.*",
        "/api/medical-records/.*",
        "/api/phi/.*",
        "/api/nphies/.*",
        "/api/admin/.*",
      ],
      rateLimiting: {
        enabled: true,
        configs: new Map([
          [
            "default",
            {
              windowMs: 60000,
              maxRequests: 100,
              skipSuccessfulRequests: false,
              message: "Too many requests",
            },
          ],
          [
            "/api/auth/login",
            {
              windowMs: 300000,
              maxRequests: 5,
              skipSuccessfulRequests: true,
              message: "Too many login attempts",
            },
          ],
          [
            "/api/phi/.*",
            {
              windowMs: 60000,
              maxRequests: 20,
              skipSuccessfulRequests: false,
              message: "PHI access rate limit exceeded",
            },
          ],
          [
            "/api/nphies/.*",
            {
              windowMs: 60000,
              maxRequests: 50,
              skipSuccessfulRequests: false,
              message: "NPHIES API rate limit exceeded",
            },
          ],
        ]),
      },
      geoRestrictions: {
        allowedCountries: ["SA", "AE", "KW", "QA", "BH", "OM"], // GCC countries
        blockedCountries: [],
      },
    };
  }

  /**
   * Initialize suspicious patterns
   */
  private initializeSuspiciousPatterns(): void {
    this.suspiciousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // Script tags
      /javascript:/gi, // JavaScript protocols
      /on\w+\s*=/gi, // Event handlers
      /expression\s*\(/gi, // CSS expressions
      /@@version/gi, // SQL Server version
      /union\s+select/gi, // SQL injection
      /drop\s+table/gi, // SQL drop commands
      /';\s*drop\s+/gi, // SQL injection patterns
      /\/\*.*\*\//gi, // SQL comments
      /xp_cmdshell/gi, // SQL Server command execution
      /<iframe/gi, // Iframe injections
      /eval\s*\(/gi, // JavaScript eval
      /setTimeout\s*\(/gi, // Dangerous JavaScript functions
      /setInterval\s*\(/gi,
    ];
  }

  /**
   * Utility methods
   */
  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      (request as any).ip ||
      "127.0.0.1"
    );
  }

  private async validateSession(
    sessionId: string,
    context: SecurityContext
  ): Promise<boolean> {
    // This would integrate with the session management system
    const sessions = this.securityEngine.getActiveSessions();
    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session) return false;

    // Update context with user info
    context.userId = session.userId;

    return true;
  }

  private containsUnencryptedPHI(payload: string): boolean {
    // Simplified PHI detection - in production, use more sophisticated detection
    const phiPatterns = [
      /\b\d{10}\b/, // National ID patterns
      /\b\d{4}-\d{4}-\d{4}-\d{4}\b/, // Credit card patterns
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email patterns
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN patterns
    ];

    return phiPatterns.some((pattern) => pattern.test(payload));
  }

  private async getCountryFromIP(ipAddress: string): Promise<string> {
    // Simplified - in production, integrate with GeoIP service
    if (ipAddress.startsWith("192.168.") || ipAddress === "127.0.0.1") {
      return "SA"; // Default to Saudi Arabia for local/development
    }
    return "US"; // Default fallback
  }

  private isHealthcareDataEndpoint(route: string): boolean {
    const healthcareRoutes = [
      "/api/patients",
      "/api/medical-records",
      "/api/phi",
      "/api/diagnoses",
      "/api/prescriptions",
      "/api/lab-results",
    ];
    return healthcareRoutes.some((pattern) => route.startsWith(pattern));
  }

  private isNPHIESEndpoint(route: string): boolean {
    return route.startsWith("/api/nphies");
  }

  private async detectSuspiciousIPActivity(
    ipAddress: string,
    context: SecurityContext
  ): Promise<void> {
    // Check recent requests from this IP
    const recentRequests = Array.from(this.requestCounts.entries())
      .filter(([key]) => key.startsWith(ipAddress))
      .reduce((sum, [, data]) => sum + data.count, 0);

    if (recentRequests > 1000) {
      // Threshold for suspicious activity
      context.riskLevel = "HIGH";
      await this.securityEngine.logAccess(
        "SUSPICIOUS_IP_ACTIVITY",
        "WARNING",
        context.userId,
        context.sessionId,
        { ipAddress, requestCount: recentRequests },
        "HIGH",
        "IP_MONITORING"
      );
    }
  }

  private async logSecureRequest(
    context: SecurityContext,
    status: "SUCCESS" | "BLOCKED",
    error?: Error
  ): Promise<void> {
    await this.securityEngine.logAccess(
      `REQUEST_${status}`,
      status === "SUCCESS" ? "SUCCESS" : "FAILURE",
      context.userId,
      context.sessionId,
      {
        requestId: context.requestId,
        route: context.route,
        method: context.method,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        error: error?.message,
      },
      context.riskLevel,
      "MIDDLEWARE"
    );
  }

  private createSecurityResponse(
    error: SecurityError,
    context: SecurityContext
  ): NextResponse {
    const response = new NextResponse(
      JSON.stringify({
        error: "Security violation",
        code: error.code,
        message: error.message,
        requestId: context.requestId,
        timestamp: context.timestamp.toISOString(),
      }),
      {
        status: this.getStatusCodeForError(error),
        headers: {
          "Content-Type": "application/json",
          "X-Security-Error": error.code,
          "X-Risk-Level": error.severity,
        },
      }
    );

    // Apply basic security headers even for error responses
    const basicHeaders = this.securityEngine.getSecurityHeaders();
    Object.entries(basicHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  private getStatusCodeForError(error: SecurityError): number {
    switch (error.code) {
      case "RATE_LIMIT_EXCEEDED":
        return 429;
      case "AUTHENTICATION_REQUIRED":
      case "INVALID_SESSION":
        return 401;
      case "IP_BLOCKED":
      case "IP_BLACKLISTED":
      case "GEO_BLOCKED":
        return 403;
      case "HTTPS_REQUIRED":
        return 426;
      case "MALICIOUS_PAYLOAD":
      case "UNENCRYPTED_PHI":
        return 400;
      default:
        return 403;
    }
  }

  private startCleanupTasks(): void {
    // Cleanup rate limiting data
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requestCounts) {
        if (data.resetTime < now) {
          this.requestCounts.delete(key);
        }
      }
    }, 60000); // Every minute

    // Cleanup blocked IPs (unblock after 24 hours)
    setInterval(() => {
      // In production, implement proper IP unblocking logic with database persistence
      this.blockedIPs.clear();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }
}

/**
 * Custom Security Error class
 */
class SecurityError extends Error {
  constructor(
    public code: string,
    message: string,
    public severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

/**
 * Export middleware instance
 */
export const securityMiddleware = new SecurityMiddleware();

/**
 * Next.js middleware function
 */
export async function middleware(request: NextRequest) {
  return await securityMiddleware.handleRequest(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
