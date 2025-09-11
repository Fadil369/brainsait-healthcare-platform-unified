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

