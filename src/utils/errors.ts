/**
 * Custom error classes for the Healthcare Platform
 * These provide structured error handling that's HIPAA compliant
 */

export class ComplianceError extends Error {
  constructor(message: string, public code: string = 'COMPLIANCE_ERROR') {
    super(message);
    this.name = 'ComplianceError';
  }
}

export class HealthcareAPIError extends Error {
  constructor(message: string, public code: string = 'HEALTHCARE_API_ERROR', public status = 500) {
    super(message);
    this.name = 'HealthcareAPIError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public fields?: string[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class PHIAccessError extends Error {
  constructor(message: string = 'PHI access violation') {
    super(message);
    this.name = 'PHIAccessError';
  }
}

/**
 * Sanitizes error messages to prevent PHI/sensitive data leakage.
 * Never expose internal error details in production.
 */
export function sanitizeErrorMessage(error: Error): string {
  // List of patterns that might indicate sensitive data
  const sensitivePatterns = [
    /patient[_\s]?id/i,
    /ssn/i,
    /social[_\s]?security/i,
    /medical[_\s]?record/i,
    /phi/i,
    /national[_\s]?id/i,
    /mrn/i,
    /\b\d{9,10}\b/, // Saudi National ID pattern
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
  ];

  const message = error.message;
  
  // Check if message contains sensitive patterns
  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      return 'An error occurred while processing your request.';
    }
  }
  
  // In production, return generic message for internal errors
  if (process.env.NODE_ENV === 'production') {
    if (error instanceof ValidationError) {
      return error.message;
    }
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      return error.message;
    }
    if (error instanceof RateLimitError) {
      return error.message;
    }
    // For all other errors, return generic message
    return 'An unexpected error occurred.';
  }
  
  return message;
}

/**
 * Converts any error to a structured response object suitable for API responses.
 */
export function toErrorResponse(error: unknown): { 
  error: string; 
  code?: string; 
  status: number;
} {
  if (error instanceof ValidationError) {
    return { error: error.message, code: 'VALIDATION_ERROR', status: 400 };
  }
  if (error instanceof AuthenticationError) {
    return { error: error.message, code: 'AUTHENTICATION_ERROR', status: 401 };
  }
  if (error instanceof AuthorizationError) {
    return { error: error.message, code: 'AUTHORIZATION_ERROR', status: 403 };
  }
  if (error instanceof RateLimitError) {
    return { error: error.message, code: 'RATE_LIMIT_ERROR', status: 429 };
  }
  if (error instanceof PHIAccessError) {
    return { error: 'Access denied', code: 'PHI_ACCESS_ERROR', status: 403 };
  }
  if (error instanceof HealthcareAPIError) {
    return { 
      error: sanitizeErrorMessage(error), 
      code: error.code, 
      status: error.status 
    };
  }
  if (error instanceof ComplianceError) {
    return { 
      error: sanitizeErrorMessage(error), 
      code: error.code, 
      status: 400 
    };
  }
  if (error instanceof Error) {
    return { 
      error: sanitizeErrorMessage(error), 
      code: 'INTERNAL_ERROR', 
      status: 500 
    };
  }
  
  return { error: 'An unexpected error occurred.', code: 'UNKNOWN_ERROR', status: 500 };
}

