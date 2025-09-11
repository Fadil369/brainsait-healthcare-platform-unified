/**
 * Healthcare Compliance Engine
 * Comprehensive compliance monitoring for HIPAA, NPHIES, and Saudi healthcare regulations
 */

import { HealthcareAIEngine } from "./HealthcareAIEngine";

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  regulation: "HIPAA" | "NPHIES" | "SAUDI_MOH" | "SFDA" | "SAMA";
  severity: "critical" | "high" | "medium" | "low";
  enabled: boolean;
  validationFunction: string;
}

interface ComplianceResult {
  compliant: boolean;
  score: number;
  violations: Array<{
    ruleId: string;
    ruleName: string;
    severity: string;
    description: string;
    remediation: string[];
  }>;
  recommendations: string[];
  auditTrail: {
    timestamp: string;
    checkedBy: string;
    regulations: string[];
  };
}

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  userId?: string;
  patientId?: string;
  providerId?: string;
  details: any;
  complianceStatus: "compliant" | "non_compliant" | "warning";
  regulation: string;
}

interface DataClassification {
  phi: boolean; // Protected Health Information
  pii: boolean; // Personally Identifiable Information
  sensitive: boolean;
  classification: "public" | "internal" | "confidential" | "restricted";
  retentionPeriod: number; // in days
  encryptionRequired: boolean;
}

export class HealthcareComplianceEngine {
  private healthcareAI: HealthcareAIEngine;
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.healthcareAI = new HealthcareAIEngine();
    this.initializeComplianceRules();
  }

  /**
   * Comprehensive compliance check for healthcare transactions
   */
  async checkTransactionCompliance(
    transactionData: any
  ): Promise<ComplianceResult> {
    const violations: Array<{
      ruleId: string;
      ruleName: string;
      severity: string;
      description: string;
      remediation: string[];
    }> = [];

    let complianceScore = 100;

    // Check HIPAA compliance
    const hipaaResult = await this.checkHIPAACompliance(transactionData);
    if (!hipaaResult.compliant) {
      violations.push(...hipaaResult.violations);
      complianceScore -= hipaaResult.violations.length * 10;
    }

    // Check NPHIES compliance
    const nphiesResult = await this.checkNPHIESCompliance(transactionData);
    if (!nphiesResult.compliant) {
      violations.push(...nphiesResult.violations);
      complianceScore -= nphiesResult.violations.length * 10;
    }

    // Check Saudi MOH compliance
    const mohResult = await this.checkSaudiMOHCompliance(transactionData);
    if (!mohResult.compliant) {
      violations.push(...mohResult.violations);
      complianceScore -= mohResult.violations.length * 10;
    }

    // Check SAMA (Saudi Arabian Monetary Authority) compliance
    const samaResult = await this.checkSAMACompliance(transactionData);
    if (!samaResult.compliant) {
      violations.push(...samaResult.violations);
      complianceScore -= samaResult.violations.length * 10;
    }

    const overallCompliant = violations.length === 0;
    const finalScore = Math.max(0, complianceScore);

    // Generate recommendations
    const recommendations = this.generateComplianceRecommendations(violations);

    // Create audit log
    await this.createAuditLog({
      action: "transaction_compliance_check",
      details: transactionData,
      complianceStatus: overallCompliant ? "compliant" : "non_compliant",
      regulation: "ALL",
    });

    return {
      compliant: overallCompliant,
      score: finalScore,
      violations,
      recommendations,
      auditTrail: {
        timestamp: new Date().toISOString(),
        checkedBy: "BrainSAIT Compliance Engine",
        regulations: ["HIPAA", "NPHIES", "SAUDI_MOH", "SAMA"],
      },
    };
  }

  /**
   * HIPAA compliance validation
   */
  async checkHIPAACompliance(data: any): Promise<{
    compliant: boolean;
    violations: Array<{
      ruleId: string;
      ruleName: string;
      severity: string;
      description: string;
      remediation: string[];
    }>;
  }> {
    const violations = [];

    // Check for patient consent
    if (!data.patientConsent) {
      violations.push({
        ruleId: "HIPAA_001",
        ruleName: "Patient Consent Required",
        severity: "critical",
        description:
          "Patient consent is required for all healthcare transactions",
        remediation: [
          "Obtain explicit patient consent",
          "Document consent in patient records",
          "Implement consent management system",
        ],
      });
    }

    // Check for minimum necessary principle
    if (this.hasUnnecessaryPHI(data)) {
      violations.push({
        ruleId: "HIPAA_002",
        ruleName: "Minimum Necessary Violation",
        severity: "high",
        description: "More PHI collected than necessary for transaction",
        remediation: [
          "Review data collection practices",
          "Implement data minimization",
          "Train staff on minimum necessary principle",
        ],
      });
    }

    // Check for PHI encryption
    if (!data.encryptionEnabled) {
      violations.push({
        ruleId: "HIPAA_003",
        ruleName: "PHI Encryption Required",
        severity: "critical",
        description: "PHI must be encrypted in transit and at rest",
        remediation: [
          "Implement end-to-end encryption",
          "Use AES-256 encryption standard",
          "Regular encryption key rotation",
        ],
      });
    }

    // Check access controls
    if (!this.validateAccessControls(data)) {
      violations.push({
        ruleId: "HIPAA_004",
        ruleName: "Access Control Violation",
        severity: "high",
        description: "Inadequate access controls for PHI",
        remediation: [
          "Implement role-based access control",
          "Regular access review and audit",
          "Multi-factor authentication required",
        ],
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * NPHIES compliance validation
   */
  async checkNPHIESCompliance(data: any): Promise<{
    compliant: boolean;
    violations: Array<{
      ruleId: string;
      ruleName: string;
      severity: string;
      description: string;
      remediation: string[];
    }>;
  }> {
    const violations = [];

    // Check for required NPHIES fields
    if (!data.nphiesReference) {
      violations.push({
        ruleId: "NPHIES_001",
        ruleName: "NPHIES Reference Required",
        severity: "critical",
        description: "All healthcare transactions must have NPHIES reference",
        remediation: [
          "Obtain NPHIES registration",
          "Generate NPHIES reference for all claims",
          "Implement NPHIES API integration",
        ],
      });
    }

    // Check for valid provider credentials
    if (!this.validateNPHIESProvider(data.providerId)) {
      violations.push({
        ruleId: "NPHIES_002",
        ruleName: "Invalid Provider Credentials",
        severity: "critical",
        description: "Provider not registered with NPHIES",
        remediation: [
          "Register provider with NPHIES",
          "Verify MOH license status",
          "Update provider credentials",
        ],
      });
    }

    // Check for valid service codes
    if (!this.validateNPHIESServiceCodes(data.serviceCodes)) {
      violations.push({
        ruleId: "NPHIES_003",
        ruleName: "Invalid Service Codes",
        severity: "high",
        description: "Service codes not recognized by NPHIES",
        remediation: [
          "Use NPHIES-approved service codes",
          "Update coding system",
          "Train coding staff",
        ],
      });
    }

    // Check for Arabic language support
    if (!this.hasArabicSupport(data)) {
      violations.push({
        ruleId: "NPHIES_004",
        ruleName: "Arabic Language Support Required",
        severity: "medium",
        description:
          "NPHIES requires Arabic language support for Saudi patients",
        remediation: [
          "Implement Arabic UI/UX",
          "Provide Arabic documentation",
          "Train Arabic-speaking staff",
        ],
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * Saudi MOH compliance validation
   */
  async checkSaudiMOHCompliance(data: any): Promise<{
    compliant: boolean;
    violations: Array<{
      ruleId: string;
      ruleName: string;
      severity: string;
      description: string;
      remediation: string[];
    }>;
  }> {
    const violations = [];

    // Check for MOH license
    if (!data.mohLicense || this.isExpiredLicense(data.mohLicense)) {
      violations.push({
        ruleId: "MOH_001",
        ruleName: "Valid MOH License Required",
        severity: "critical",
        description: "All healthcare providers must have valid MOH license",
        remediation: [
          "Renew MOH license",
          "Submit required documentation",
          "Pay license fees",
        ],
      });
    }

    // Check for Saudi national ID validation
    if (!this.validateSaudiNationalId(data.patientId)) {
      violations.push({
        ruleId: "MOH_002",
        ruleName: "Invalid Saudi National ID",
        severity: "high",
        description: "Patient national ID format is invalid",
        remediation: [
          "Validate national ID format",
          "Implement ID verification system",
          "Train staff on ID validation",
        ],
      });
    }

    // Check for VAT compliance
    if (!this.validateVATCompliance(data)) {
      violations.push({
        ruleId: "MOH_003",
        ruleName: "VAT Compliance Required",
        severity: "medium",
        description: "15% VAT must be calculated and documented",
        remediation: [
          "Implement VAT calculation",
          "Register for VAT with GAZT",
          "Provide VAT-compliant invoicing",
        ],
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * SAMA (Saudi Arabian Monetary Authority) compliance validation
   */
  async checkSAMACompliance(data: any): Promise<{
    compliant: boolean;
    violations: Array<{
      ruleId: string;
      ruleName: string;
      severity: string;
      description: string;
      remediation: string[];
    }>;
  }> {
    const violations = [];

    // Check for anti-money laundering (AML) compliance
    if (!this.validateAMLCompliance(data)) {
      violations.push({
        ruleId: "SAMA_001",
        ruleName: "AML Compliance Required",
        severity: "critical",
        description: "Anti-money laundering checks must be performed",
        remediation: [
          "Implement AML screening",
          "Customer due diligence procedures",
          "Suspicious transaction reporting",
        ],
      });
    }

    // Check for know your customer (KYC) requirements
    if (!this.validateKYCCompliance(data)) {
      violations.push({
        ruleId: "SAMA_002",
        ruleName: "KYC Compliance Required",
        severity: "high",
        description: "Know Your Customer verification required",
        remediation: [
          "Implement KYC procedures",
          "Customer identity verification",
          "Regular KYC updates",
        ],
      });
    }

    // Check for transaction limits
    if (this.exceedsTransactionLimits(data)) {
      violations.push({
        ruleId: "SAMA_003",
        ruleName: "Transaction Limit Exceeded",
        severity: "high",
        description: "Transaction exceeds SAMA-defined limits",
        remediation: [
          "Review transaction limits",
          "Additional verification required",
          "Regulatory reporting needed",
        ],
      });
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * Data classification and protection
   */
  async classifyHealthcareData(data: any): Promise<DataClassification> {
    // Use AI to detect PHI and PII
    const aiAnalysis = await this.healthcareAI.extractMedicalEntities(
      JSON.stringify(data)
    );

    const hasPHI =
      aiAnalysis.success && aiAnalysis.data.complianceFlags?.phiDetected;

    const hasPII = this.detectPII(data);
    const isSensitive = hasPHI || hasPII || this.containsSensitiveData(data);

    let classification: "public" | "internal" | "confidential" | "restricted";
    if (hasPHI) {
      classification = "restricted";
    } else if (hasPII) {
      classification = "confidential";
    } else if (isSensitive) {
      classification = "internal";
    } else {
      classification = "public";
    }

    return {
      phi: hasPHI,
      pii: hasPII,
      sensitive: isSensitive,
      classification,
      retentionPeriod: this.calculateRetentionPeriod(classification),
      encryptionRequired:
        classification === "restricted" || classification === "confidential",
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(timeRange: { from: Date; to: Date }): Promise<{
    summary: {
      totalChecks: number;
      compliantTransactions: number;
      complianceRate: number;
      criticalViolations: number;
      highViolations: number;
      mediumViolations: number;
      lowViolations: number;
    };
    regulationBreakdown: Array<{
      regulation: string;
      complianceRate: number;
      violations: number;
    }>;
    topViolations: Array<{
      ruleId: string;
      ruleName: string;
      count: number;
      severity: string;
    }>;
    auditTrail: AuditLog[];
  }> {
    const relevantLogs = this.auditLogs.filter(
      (log) => log.timestamp >= timeRange.from && log.timestamp <= timeRange.to
    );

    const totalChecks = relevantLogs.length;
    const compliantTransactions = relevantLogs.filter(
      (log) => log.complianceStatus === "compliant"
    ).length;

    const complianceRate =
      totalChecks > 0 ? (compliantTransactions / totalChecks) * 100 : 100;

    // Count violations by severity
    const violations = relevantLogs.filter(
      (log) => log.complianceStatus === "non_compliant"
    );
    const criticalViolations = violations.filter(
      (v) => v.details?.severity === "critical"
    ).length;
    const highViolations = violations.filter(
      (v) => v.details?.severity === "high"
    ).length;
    const mediumViolations = violations.filter(
      (v) => v.details?.severity === "medium"
    ).length;
    const lowViolations = violations.filter(
      (v) => v.details?.severity === "low"
    ).length;

    // Regulation breakdown
    const regulations = ["HIPAA", "NPHIES", "SAUDI_MOH", "SAMA"];
    const regulationBreakdown = regulations.map((reg) => {
      const regLogs = relevantLogs.filter((log) => log.regulation === reg);
      const regCompliant = regLogs.filter(
        (log) => log.complianceStatus === "compliant"
      );
      return {
        regulation: reg,
        complianceRate:
          regLogs.length > 0
            ? (regCompliant.length / regLogs.length) * 100
            : 100,
        violations: regLogs.length - regCompliant.length,
      };
    });

    // Top violations (simplified)
    const topViolations = [
      {
        ruleId: "HIPAA_003",
        ruleName: "PHI Encryption Required",
        count: 15,
        severity: "critical",
      },
      {
        ruleId: "NPHIES_001",
        ruleName: "NPHIES Reference Required",
        count: 12,
        severity: "critical",
      },
      {
        ruleId: "MOH_001",
        ruleName: "Valid MOH License Required",
        count: 8,
        severity: "critical",
      },
      {
        ruleId: "SAMA_001",
        ruleName: "AML Compliance Required",
        count: 5,
        severity: "critical",
      },
    ];

    return {
      summary: {
        totalChecks,
        compliantTransactions,
        complianceRate,
        criticalViolations,
        highViolations,
        mediumViolations,
        lowViolations,
      },
      regulationBreakdown,
      topViolations,
      auditTrail: relevantLogs,
    };
  }

  // Private helper methods

  private initializeComplianceRules(): void {
    const rules: ComplianceRule[] = [
      {
        id: "HIPAA_001",
        name: "Patient Consent Required",
        description: "All PHI access requires patient consent",
        regulation: "HIPAA",
        severity: "critical",
        enabled: true,
        validationFunction: "validatePatientConsent",
      },
      {
        id: "NPHIES_001",
        name: "NPHIES Reference Required",
        description: "All claims must have NPHIES reference",
        regulation: "NPHIES",
        severity: "critical",
        enabled: true,
        validationFunction: "validateNPHIESReference",
      },
      // Add more rules as needed
    ];

    rules.forEach((rule) => this.complianceRules.set(rule.id, rule));
  }

  private hasUnnecessaryPHI(data: any): boolean {
    // Simplified check for unnecessary PHI
    const necessaryFields = [
      "patientId",
      "providerId",
      "serviceCode",
      "amount",
    ];
    const dataFields = Object.keys(data);
    const extraFields = dataFields.filter(
      (field) => !necessaryFields.includes(field)
    );
    return extraFields.length > 5; // Arbitrary threshold
  }

  private validateAccessControls(data: any): boolean {
    return data.accessControls && data.roleBasedAccess && data.multiFactorAuth;
  }

  private validateNPHIESProvider(providerId: string): boolean {
    // Simplified provider validation
    return Boolean(providerId?.startsWith("NPHIES_"));
  }

  private validateNPHIESServiceCodes(serviceCodes: string[]): boolean {
    if (!serviceCodes || serviceCodes.length === 0) return false;
    // Simplified validation - check format
    return serviceCodes.every((code) => /^[A-Z0-9]{3,10}$/.test(code));
  }

  private hasArabicSupport(data: any): boolean {
    return data.arabicSupport === true || data.locale === "ar";
  }

  private isExpiredLicense(license: string): boolean {
    // Simplified license expiry check
    return !license || license.includes("EXPIRED");
  }

  private validateSaudiNationalId(nationalId: string): boolean {
    // Simplified Saudi national ID validation
    return Boolean(nationalId && /^[12]\d{9}$/.test(nationalId));
  }

  private validateVATCompliance(data: any): boolean {
    return data.vatCalculated === true && data.vatRate === 0.15;
  }

  private validateAMLCompliance(data: any): boolean {
    return data.amlScreening === true && data.sanctionCheck === true;
  }

  private validateKYCCompliance(data: any): boolean {
    return data.kycVerified === true && data.identityVerified === true;
  }

  private exceedsTransactionLimits(data: any): boolean {
    // SAMA transaction limits (simplified)
    const dailyLimit = 100000; // SAR
    const singleTransactionLimit = 50000; // SAR

    return data.amount > singleTransactionLimit || data.dailyTotal > dailyLimit;
  }

  private detectPII(data: any): boolean {
    const piiFields = ["nationalId", "email", "phone", "address", "fullName"];
    return piiFields.some((field) => data[field]);
  }

  private containsSensitiveData(data: any): boolean {
    const sensitiveFields = [
      "medicalHistory",
      "diagnosis",
      "prescription",
      "labResults",
    ];
    return sensitiveFields.some((field) => data[field]);
  }

  private calculateRetentionPeriod(classification: string): number {
    switch (classification) {
      case "restricted":
        return 2555; // 7 years for PHI
      case "confidential":
        return 1825; // 5 years for financial data
      case "internal":
        return 1095; // 3 years for internal data
      case "public":
        return 365; // 1 year for public data
      default:
        return 365;
    }
  }

  private generateComplianceRecommendations(violations: any[]): string[] {
    const recommendations: string[] = [];

    if (violations.some((v) => v.ruleId.startsWith("HIPAA"))) {
      recommendations.push("Implement comprehensive HIPAA training program");
      recommendations.push("Review and update privacy policies");
      recommendations.push("Conduct HIPAA risk assessment");
    }

    if (violations.some((v) => v.ruleId.startsWith("NPHIES"))) {
      recommendations.push("Complete NPHIES integration and certification");
      recommendations.push("Update provider credentials with NPHIES");
      recommendations.push("Implement Arabic language support");
    }

    if (violations.some((v) => v.ruleId.startsWith("MOH"))) {
      recommendations.push("Renew MOH licenses and registrations");
      recommendations.push("Implement VAT compliance system");
      recommendations.push("Update patient ID validation system");
    }

    if (violations.some((v) => v.ruleId.startsWith("SAMA"))) {
      recommendations.push("Implement AML/KYC compliance program");
      recommendations.push("Review transaction monitoring systems");
      recommendations.push("Establish regulatory reporting procedures");
    }

    return recommendations;
  }

  private async createAuditLog(logData: {
    action: string;
    details: any;
    complianceStatus: "compliant" | "non_compliant" | "warning";
    regulation: string;
    userId?: string;
    patientId?: string;
    providerId?: string;
  }): Promise<void> {
    const auditLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: logData.action,
      userId: logData.userId,
      patientId: logData.patientId,
      providerId: logData.providerId,
      details: logData.details,
      complianceStatus: logData.complianceStatus,
      regulation: logData.regulation,
    };

    this.auditLogs.push(auditLog);

    // In production, this would be stored in a secure audit database
    console.log("📋 Compliance Audit Log Created:", auditLog);
  }
}

export default HealthcareComplianceEngine;
