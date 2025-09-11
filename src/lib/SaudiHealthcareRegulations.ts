/**
 * Saudi Healthcare Regulatory Requirements Module
 * Comprehensive implementation of Saudi healthcare market regulations
 * Including MOH, NPHIES, ZATCA, and Vision 2030 requirements
 */

export interface SaudiHealthcareProvider {
  mohLicenseNumber: string;
  licenseType: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'radiology';
  licenseStatus: 'active' | 'suspended' | 'expired' | 'pending';
  licenseExpiryDate: string;
  facilityCertification: string[];
  accreditation: 'CBAHI' | 'JCI' | 'ISO' | 'none';
  specialties: string[];
  operatingRegion: 'riyadh' | 'makkah' | 'eastern' | 'asir' | 'jazan' | 'najran' | 'tabuk' | 'hail' | 'northern_border' | 'al_bahah' | 'al_jawf' | 'qassim' | 'madinah';
}

export interface SaudiPatientIdentification {
  nationalId?: string; // For Saudi citizens
  iqamaNumber?: string; // For residents
  passportNumber?: string; // For visitors
  gccId?: string; // For GCC nationals
  patientType: 'citizen' | 'resident' | 'visitor' | 'gcc_national';
  insuranceProvider: string;
  policyNumber: string;
  coverageLevel: 'basic' | 'enhanced' | 'premium' | 'government';
}

export interface NPHIESClaim {
  claimId: string;
  providerId: string;
  patientIdentification: SaudiPatientIdentification;
  serviceDate: string;
  diagnosisCodes: string[]; // ICD-10 codes
  procedureCodes: string[]; // CPT codes
  medications: NPHIESMedication[];
  totalAmount: number;
  currency: 'SAR';
  claimType: 'institutional' | 'professional' | 'pharmacy' | 'dental' | 'vision';
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  preAuthorizationRequired: boolean;
  preAuthorizationNumber?: string;
}

export interface NPHIESMedication {
  ndc: string; // National Drug Code
  drugName: string;
  arabicName: string;
  dosage: string;
  quantity: number;
  daysSupply: number;
  unitPrice: number;
  totalPrice: number;
  isGeneric: boolean;
  manufacturerCountry: string;
  registrationNumber: string; // SFDA registration
}

export interface MOHQualityMetrics {
  patientSafetyScore: number;
  infectionControlScore: number;
  clinicalOutcomesScore: number;
  patientSatisfactionScore: number;
  timelinessScore: number;
  resourceUtilizationScore: number;
  overallQualityRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
}

export interface Vision2030HealthGoals {
  digitalHealthAdoption: number; // Percentage
  patientEngagementLevel: number;
  preventiveCareUtilization: number;
  chronicDiseaseManagement: number;
  healthcareAccessibility: number;
  costEfficiencyRating: number;
  sustainabilityScore: number;
}

export interface ZATCACompliance {
  vatRegistrationNumber: string;
  taxInvoiceCompliant: boolean;
  eInvoicingEnabled: boolean;
  zatcaApprovalNumber: string;
  lastAuditDate: string;
  complianceScore: number;
}

export class SaudiHealthcareRegulatoryEngine {
  private readonly MOH_REQUIRED_FIELDS = [
    'mohLicenseNumber',
    'licenseStatus',
    'licenseExpiryDate',
    'facilityCertification'
  ];

  private readonly NPHIES_ENDPOINTS = {
    eligibility: 'https://nphies.sa/eligibility/v1',
    preauth: 'https://nphies.sa/preauth/v1',
    claim: 'https://nphies.sa/claim/v1',
    payment: 'https://nphies.sa/payment/v1'
  };

  private readonly SAUDI_MEDICAL_SPECIALTIES = [
    'internal_medicine',
    'surgery',
    'pediatrics',
    'obstetrics_gynecology',
    'emergency_medicine',
    'anesthesiology',
    'radiology',
    'pathology',
    'psychiatry',
    'dermatology',
    'ophthalmology',
    'orthopedics',
    'cardiology',
    'neurology',
    'oncology',
    'family_medicine',
    'preventive_medicine'
  ];

  // Validate MOH provider licensing
  validateMOHLicense(provider: SaudiHealthcareProvider): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    expiryDays: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check license number format (simplified)
    if (!provider.mohLicenseNumber || !/^MOH-\d{6}-\d{4}$/.test(provider.mohLicenseNumber)) {
      errors.push('Invalid MOH license number format. Expected: MOH-XXXXXX-YYYY');
    }

    // Check license status
    if (provider.licenseStatus !== 'active') {
      errors.push(`License is not active. Current status: ${provider.licenseStatus}`);
    }

    // Check expiry date
    const expiryDate = new Date(provider.licenseExpiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      errors.push('MOH license has expired');
    } else if (daysUntilExpiry <= 30) {
      warnings.push(`MOH license expires in ${daysUntilExpiry} days`);
    }

    // Validate certifications
    if (!provider.facilityCertification || provider.facilityCertification.length === 0) {
      warnings.push('No facility certifications on file');
    }

    // Check accreditation
    if (provider.accreditation === 'none' && provider.licenseType === 'hospital') {
      warnings.push('Hospital should have accreditation (CBAHI, JCI, or ISO)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      expiryDays: daysUntilExpiry
    };
  }

  // Validate patient identification for Saudi healthcare system
  validatePatientIdentification(patient: SaudiPatientIdentification): {
    valid: boolean;
    errors: string[];
    eligibleForServices: string[];
  } {
    const errors: string[] = [];
    const eligibleServices: string[] = [];

    // Validate identification based on patient type
    switch (patient.patientType) {
      case 'citizen':
        if (!patient.nationalId || !/^\d{10}$/.test(patient.nationalId)) {
          errors.push('Valid 10-digit National ID is required for Saudi citizens');
        } else {
          eligibleServices.push('all_services', 'government_insurance', 'private_insurance');
        }
        break;

      case 'resident':
        if (!patient.iqamaNumber || !/^\d{10}$/.test(patient.iqamaNumber)) {
          errors.push('Valid 10-digit Iqama number is required for residents');
        } else {
          eligibleServices.push('all_services', 'private_insurance', 'employer_insurance');
        }
        break;

      case 'visitor':
        if (!patient.passportNumber) {
          errors.push('Passport number is required for visitors');
        } else {
          eligibleServices.push('emergency_services', 'private_pay', 'travel_insurance');
        }
        break;

      case 'gcc_national':
        if (!patient.gccId) {
          errors.push('GCC ID is required for GCC nationals');
        } else {
          eligibleServices.push('emergency_services', 'basic_services', 'gcc_agreement_services');
        }
        break;
    }

    // Validate insurance information
    if (!patient.insuranceProvider) {
      errors.push('Insurance provider is required');
    }

    if (!patient.policyNumber) {
      errors.push('Policy number is required');
    }

    return {
      valid: errors.length === 0,
      errors,
      eligibleForServices: eligibleServices
    };
  }

  // Validate NPHIES claim submission
  validateNPHIESClaim(claim: NPHIESClaim): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    estimatedProcessingTime: string;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!claim.claimId || !/^CLM-\d{8}-\d{6}$/.test(claim.claimId)) {
      errors.push('Invalid claim ID format. Expected: CLM-YYYYMMDD-XXXXXX');
    }

    if (!claim.providerId) {
      errors.push('Provider ID is required');
    }

    // Validate patient identification
    const patientValidation = this.validatePatientIdentification(claim.patientIdentification);
    if (!patientValidation.valid) {
      errors.push(...patientValidation.errors);
    }

    // Validate service date
    const serviceDate = new Date(claim.serviceDate);
    const today = new Date();
    const daysSinceService = Math.ceil((today.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceService > 365) {
      errors.push('Claims must be submitted within 365 days of service date');
    } else if (daysSinceService > 90) {
      warnings.push('Claims submitted after 90 days may require additional documentation');
    }

    // Validate diagnosis codes (ICD-10)
    if (!claim.diagnosisCodes || claim.diagnosisCodes.length === 0) {
      errors.push('At least one diagnosis code is required');
    } else {
      const invalidDiagnosisCodes = claim.diagnosisCodes.filter(code => 
        !/^[A-Z]\d{2}(\.\d{1,3})?$/.test(code)
      );
      if (invalidDiagnosisCodes.length > 0) {
        errors.push(`Invalid ICD-10 diagnosis codes: ${invalidDiagnosisCodes.join(', ')}`);
      }
    }

    // Validate procedure codes (CPT)
    if (!claim.procedureCodes || claim.procedureCodes.length === 0) {
      errors.push('At least one procedure code is required');
    } else {
      const invalidProcedureCodes = claim.procedureCodes.filter(code => 
        !/^\d{5}$/.test(code)
      );
      if (invalidProcedureCodes.length > 0) {
        errors.push(`Invalid CPT procedure codes: ${invalidProcedureCodes.join(', ')}`);
      }
    }

    // Validate medications
    claim.medications.forEach((med, index) => {
      if (!med.registrationNumber) {
        errors.push(`Medication ${index + 1}: SFDA registration number is required`);
      }
      if (!med.arabicName) {
        warnings.push(`Medication ${index + 1}: Arabic name should be provided for Saudi market`);
      }
    });

    // Check pre-authorization requirements
    if (claim.preAuthorizationRequired && !claim.preAuthorizationNumber) {
      errors.push('Pre-authorization number is required for this service');
    }

    // Validate amount
    if (claim.totalAmount <= 0) {
      errors.push('Total amount must be greater than 0');
    }

    if (claim.currency !== 'SAR') {
      errors.push('Currency must be SAR for Saudi healthcare claims');
    }

    // Estimate processing time
    let processingTime = '2-5 business days';
    if (claim.urgencyLevel === 'emergency') {
      processingTime = '24-48 hours';
    } else if (claim.urgencyLevel === 'urgent') {
      processingTime = '1-3 business days';
    } else if (claim.totalAmount > 50000) {
      processingTime = '5-10 business days';
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      estimatedProcessingTime: processingTime
    };
  }

  // Calculate MOH quality metrics
  calculateQualityMetrics(data: {
    patientSafetyIncidents: number;
    totalPatients: number;
    infectionRate: number;
    readmissionRate: number;
    patientSatisfactionScore: number;
    averageWaitTime: number;
    resourceUtilization: number;
  }): MOHQualityMetrics {
    const patientSafetyScore = Math.max(0, 100 - (data.patientSafetyIncidents / data.totalPatients * 1000));
    const infectionControlScore = Math.max(0, 100 - (data.infectionRate * 10));
    const clinicalOutcomesScore = Math.max(0, 100 - (data.readmissionRate * 5));
    const patientSatisfactionScore = data.patientSatisfactionScore;
    const timelinessScore = Math.max(0, 100 - (data.averageWaitTime / 2));
    const resourceUtilizationScore = data.resourceUtilization;

    const overallScore = (
      patientSafetyScore +
      infectionControlScore +
      clinicalOutcomesScore +
      patientSatisfactionScore +
      timelinessScore +
      resourceUtilizationScore
    ) / 6;

    let overallQualityRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
    if (overallScore >= 90) {
      overallQualityRating = 'excellent';
    } else if (overallScore >= 80) {
      overallQualityRating = 'good';
    } else if (overallScore >= 70) {
      overallQualityRating = 'satisfactory';
    } else {
      overallQualityRating = 'needs_improvement';
    }

    return {
      patientSafetyScore: Math.round(patientSafetyScore),
      infectionControlScore: Math.round(infectionControlScore),
      clinicalOutcomesScore: Math.round(clinicalOutcomesScore),
      patientSatisfactionScore: Math.round(patientSatisfactionScore),
      timelinessScore: Math.round(timelinessScore),
      resourceUtilizationScore: Math.round(resourceUtilizationScore),
      overallQualityRating
    };
  }

  // Assess Vision 2030 alignment
  assessVision2030Compliance(metrics: {
    digitalToolsAdoption: number;
    patientPortalUsage: number;
    preventiveCareScreenings: number;
    chronicDiseasePrograms: number;
    telemedConsultations: number;
    costPerPatient: number;
    energyEfficiency: number;
  }): Vision2030HealthGoals {
    return {
      digitalHealthAdoption: Math.min(100, (metrics.digitalToolsAdoption + metrics.patientPortalUsage + metrics.telemedConsultations) / 3),
      patientEngagementLevel: metrics.patientPortalUsage,
      preventiveCareUtilization: metrics.preventiveCareScreenings,
      chronicDiseaseManagement: metrics.chronicDiseasePrograms,
      healthcareAccessibility: Math.min(100, metrics.telemedConsultations + 50), // Base accessibility + telemedicine
      costEfficiencyRating: Math.max(0, 100 - (metrics.costPerPatient / 100)), // Simplified cost efficiency
      sustainabilityScore: metrics.energyEfficiency
    };
  }

  // Validate ZATCA compliance for healthcare billing
  validateZATCACompliance(billing: {
    vatRegistrationNumber: string;
    invoiceData: any;
    eInvoicingEnabled: boolean;
  }): ZATCACompliance {
    const isVATValid = /^\d{15}$/.test(billing.vatRegistrationNumber);
    const hasRequiredInvoiceFields = billing.invoiceData && 
      billing.invoiceData.sellerInfo && 
      billing.invoiceData.buyerInfo &&
      billing.invoiceData.invoiceTotal;

    return {
      vatRegistrationNumber: billing.vatRegistrationNumber,
      taxInvoiceCompliant: isVATValid && hasRequiredInvoiceFields,
      eInvoicingEnabled: billing.eInvoicingEnabled,
      zatcaApprovalNumber: isVATValid ? `ZATCA-${Date.now()}` : '',
      lastAuditDate: new Date().toISOString(),
      complianceScore: isVATValid && hasRequiredInvoiceFields && billing.eInvoicingEnabled ? 100 : 75
    };
  }

  // Get Saudi medical specialties
  getSaudiMedicalSpecialties(): string[] {
    return this.SAUDI_MEDICAL_SPECIALTIES;
  }

  // Get NPHIES endpoints
  getNPHIESEndpoints(): typeof this.NPHIES_ENDPOINTS {
    return this.NPHIES_ENDPOINTS;
  }

  // Generate comprehensive regulatory compliance report
  generateComplianceReport(data: {
    provider: SaudiHealthcareProvider;
    patients: SaudiPatientIdentification[];
    claims: NPHIESClaim[];
    qualityData: any;
    visionMetrics: any;
    billingData: any;
  }): {
    overallCompliance: number;
    mohCompliance: any;
    nphiesCompliance: any;
    qualityMetrics: MOHQualityMetrics;
    visionAlignment: Vision2030HealthGoals;
    zatcaCompliance: ZATCACompliance;
    recommendations: string[];
  } {
    const mohValidation = this.validateMOHLicense(data.provider);
    const nphiesValidations = data.claims.map(claim => this.validateNPHIESClaim(claim));
    const qualityMetrics = this.calculateQualityMetrics(data.qualityData);
    const visionAlignment = this.assessVision2030Compliance(data.visionMetrics);
    const zatcaCompliance = this.validateZATCACompliance(data.billingData);

    const overallCompliance = Math.round(
      (mohValidation.valid ? 100 : 70) * 0.3 +
      (nphiesValidations.every(v => v.valid) ? 100 : 80) * 0.3 +
      ((qualityMetrics.patientSafetyScore + qualityMetrics.infectionControlScore + qualityMetrics.clinicalOutcomesScore) / 3) * 0.2 +
      zatcaCompliance.complianceScore * 0.2
    );

    const recommendations: string[] = [];
    if (!mohValidation.valid) {
      recommendations.push('Update MOH license and certifications');
    }
    if (qualityMetrics.overallQualityRating === 'needs_improvement') {
      recommendations.push('Implement quality improvement initiatives');
    }
    if (visionAlignment.digitalHealthAdoption < 70) {
      recommendations.push('Increase digital health adoption to align with Vision 2030');
    }
    if (zatcaCompliance.complianceScore < 90) {
      recommendations.push('Enhance ZATCA compliance for e-invoicing');
    }

    return {
      overallCompliance,
      mohCompliance: mohValidation,
      nphiesCompliance: nphiesValidations,
      qualityMetrics,
      visionAlignment,
      zatcaCompliance,
      recommendations
    };
  }
}