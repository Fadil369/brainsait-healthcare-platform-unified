export class HealthcareErrorHandler {
  static handleAPIError(error: Error, context: string): never {
    // Log error securely without PHI
    console.error(`Healthcare API Error [${context}]:`, {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    // Return sanitized error
    if (error.message.includes('PHI') || error.message.includes('sensitive')) {
      throw new Error('Healthcare data processing error');
    }
    
    throw error;
  }

  static handleSecurityError(error: Error, context: string): never {
    // Log security incidents
    console.error(`Security Error [${context}]:`, {
      message: 'Security incident detected',
      timestamp: new Date().toISOString(),
      context,
    });
    
    throw new Error('Security validation failed');
  }

  static handleComplianceError(error: Error, context: string): never {
    // Log compliance violations
    console.error(`Compliance Error [${context}]:`, {
      message: 'Compliance violation detected',
      timestamp: new Date().toISOString(),
      context,
    });
    
    throw new Error('Compliance validation failed');
  }
}
