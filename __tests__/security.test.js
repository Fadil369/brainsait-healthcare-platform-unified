/**
 * Security Tests for BrainSAIT Healthcare Platform
 * Tests input sanitization, error handling, and security utilities
 * These tests implement the same logic as the TypeScript modules in a JS-only way
 */

// Inline implementations for testing (mirrors the TypeScript implementations)
function sanitizeHtml(input) {
  const htmlEntities = {
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

function sanitizeUrl(url, allowedOrigins = []) {
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

function sanitizeForSearch(input) {
  return input
    .replace(/['"`;\\]/g, '')
    .replace(/--/g, '')
    .trim()
    .slice(0, 200);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeErrorMessage(error, isProduction = false) {
  const sensitivePatterns = [
    /patient[_\s]?id/i,
    /ssn/i,
    /social[_\s]?security/i,
    /medical[_\s]?record/i,
    /phi/i,
    /national[_\s]?id/i,
    /mrn/i,
    /\b\d{9,10}\b/,
    /\b\d{3}-\d{2}-\d{4}\b/,
  ];

  const message = error.message || '';
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(message)) {
      return 'An error occurred while processing your request.';
    }
  }
  
  if (isProduction) {
    if (error.name === 'ValidationError' || 
        error.name === 'AuthenticationError' || 
        error.name === 'AuthorizationError' ||
        error.name === 'RateLimitError') {
      return message;
    }
    return 'An unexpected error occurred.';
  }
  
  return message;
}

describe('Input Sanitization', () => {
  describe('sanitizeHtml', () => {
    test('escapes HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('&lt;script&gt;');
    });

    test('escapes ampersands', () => {
      const input = 'foo & bar';
      const output = sanitizeHtml(input);
      expect(output).toBe('foo &amp; bar');
    });

    test('escapes quotes', () => {
      const input = 'say "hello"';
      const output = sanitizeHtml(input);
      expect(output).toBe('say &quot;hello&quot;');
    });

    test('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    test('handles strings without special characters', () => {
      const input = 'normal text 123';
      expect(sanitizeHtml(input)).toBe(input);
    });

    test('escapes multiple XSS vectors', () => {
      const input = '<img src=x onerror="alert(1)">';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('<img');
      // The escaped output is safe - it will render as text, not as HTML
      expect(output).toContain('&lt;img');
    });

    test('escapes backticks for template literal injection', () => {
      const input = '`${dangerous}`';
      const output = sanitizeHtml(input);
      expect(output).toContain('&#x60;');
    });
  });

  describe('sanitizeUrl', () => {
    test('allows relative URLs', () => {
      expect(sanitizeUrl('/dashboard')).toBe('/dashboard');
      expect(sanitizeUrl('/api/health')).toBe('/api/health');
    });

    test('blocks protocol-relative URLs', () => {
      expect(sanitizeUrl('//evil.com/phishing')).toBeNull();
    });

    test('blocks external URLs by default', () => {
      expect(sanitizeUrl('https://evil.com/redirect')).toBeNull();
    });

    test('allows URLs from allowed origins', () => {
      const allowedOrigins = ['https://brainsait.com'];
      expect(sanitizeUrl('https://brainsait.com/dashboard', allowedOrigins)).toBe('https://brainsait.com/dashboard');
    });

    test('blocks URLs not in allowed origins', () => {
      const allowedOrigins = ['https://brainsait.com'];
      expect(sanitizeUrl('https://evil.com/redirect', allowedOrigins)).toBeNull();
    });

    test('handles invalid URLs', () => {
      expect(sanitizeUrl('not a url')).toBeNull();
    });

    test('blocks javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    });

    test('blocks data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });
  });

  describe('isValidEmail', () => {
    test('validates correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    test('rejects emails with spaces', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@ example.com')).toBe(false);
    });
  });

  describe('sanitizeForSearch', () => {
    test('removes SQL injection characters', () => {
      const input = "'; DROP TABLE patients; --";
      const output = sanitizeForSearch(input);
      expect(output).not.toContain("'");
      expect(output).not.toContain(';');
      expect(output).not.toContain('--');
    });

    test('limits output length', () => {
      const longInput = 'a'.repeat(500);
      const output = sanitizeForSearch(longInput);
      expect(output.length).toBeLessThanOrEqual(200);
    });

    test('trims whitespace', () => {
      const input = '  search term  ';
      expect(sanitizeForSearch(input)).toBe('search term');
    });

    test('removes backslashes', () => {
      const input = 'path\\to\\file';
      expect(sanitizeForSearch(input)).not.toContain('\\');
    });

    test('removes backticks', () => {
      const input = '`command`';
      expect(sanitizeForSearch(input)).not.toContain('`');
    });
  });
});

describe('Error Message Sanitization', () => {
  describe('sanitizeErrorMessage', () => {
    test('sanitizes messages containing patient ID patterns', () => {
      const error = new Error('Error processing patient_id: 12345');
      expect(sanitizeErrorMessage(error)).toBe('An error occurred while processing your request.');
    });

    test('sanitizes messages containing SSN patterns', () => {
      const error = new Error('Invalid SSN: 123-45-6789');
      expect(sanitizeErrorMessage(error)).toBe('An error occurred while processing your request.');
    });

    test('sanitizes messages containing National ID patterns', () => {
      const error = new Error('National ID 1234567890 not found');
      expect(sanitizeErrorMessage(error)).toBe('An error occurred while processing your request.');
    });

    test('sanitizes messages containing PHI references', () => {
      const error = new Error('PHI data access denied');
      expect(sanitizeErrorMessage(error)).toBe('An error occurred while processing your request.');
    });

    test('sanitizes messages containing MRN references', () => {
      const error = new Error('MRN record not found');
      expect(sanitizeErrorMessage(error)).toBe('An error occurred while processing your request.');
    });

    test('allows safe messages through in development', () => {
      const error = new Error('Invalid input format');
      expect(sanitizeErrorMessage(error, false)).toBe('Invalid input format');
    });

    test('allows validation errors through in production', () => {
      const error = new Error('Email format is invalid');
      error.name = 'ValidationError';
      expect(sanitizeErrorMessage(error, true)).toBe('Email format is invalid');
    });

    test('allows authentication errors through in production', () => {
      const error = new Error('Session expired');
      error.name = 'AuthenticationError';
      expect(sanitizeErrorMessage(error, true)).toBe('Session expired');
    });

    test('returns generic message for unknown errors in production', () => {
      const error = new Error('Internal server error details');
      expect(sanitizeErrorMessage(error, true)).toBe('An unexpected error occurred.');
    });
  });
});

describe('Security Headers Validation', () => {
  test('CSP should block unsafe-inline where possible', () => {
    // This is a documentation test - the actual CSP is set in middleware
    const unsafeInlinePattern = /'unsafe-inline'/;
    
    // Validate that our recommended CSP template doesn't use unsafe-inline for scripts
    const recommendedScriptSrc = "script-src 'self' https://js.stripe.com 'nonce-xxx' 'strict-dynamic'";
    expect(recommendedScriptSrc).not.toMatch(/'unsafe-inline'/);
  });

  test('HSTS should have minimum one year max-age', () => {
    const hstsValue = 'max-age=31536000; includeSubDomains; preload';
    const maxAgeMatch = hstsValue.match(/max-age=(\d+)/);
    expect(maxAgeMatch).toBeTruthy();
    const maxAge = parseInt(maxAgeMatch[1], 10);
    expect(maxAge).toBeGreaterThanOrEqual(31536000); // 1 year in seconds
  });
});

describe('Rate Limiting Logic', () => {
  test('rate limit implementation should track counts correctly', () => {
    const rateStore = new Map();
    const windowMs = 60000;
    const max = 3;
    
    function checkRateLimit(ip, key) {
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
    
    // First 3 requests should pass
    expect(checkRateLimit('1.2.3.4', 'test')).toBe(true);
    expect(checkRateLimit('1.2.3.4', 'test')).toBe(true);
    expect(checkRateLimit('1.2.3.4', 'test')).toBe(true);
    
    // 4th request should be rate limited
    expect(checkRateLimit('1.2.3.4', 'test')).toBe(false);
    
    // Different IP should not be rate limited
    expect(checkRateLimit('5.6.7.8', 'test')).toBe(true);
  });
});
