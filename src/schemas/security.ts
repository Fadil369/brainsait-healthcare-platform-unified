import { z } from "zod";

export const ComprehensiveAssessmentSchema = z.object({
  operation: z.literal("comprehensive_assessment"),
  healthcareData: z.record(z.any()),
});

export const EncryptPHISchema = z.object({
  operation: z.literal("encrypt_phi"),
  phiData: z.record(z.any()),
  ipAddress: z.string().optional(),
});

export const DecryptPHISchema = z.object({
  operation: z.literal("decrypt_phi"),
  encryptedData: z.object({
    encrypted: z.string(),
    keyId: z.string(),
    algorithm: z.string(),
    timestamp: z.string(),
    integrity: z.string(),
  }),
  ipAddress: z.string().optional(),
});

export const ValidateNPHIESSchema = z.object({
  operation: z.literal("validate_nphies"),
  data: z.record(z.any()).optional(),
});

export const ValidateHIPAASchema = z.object({
  operation: z.literal("validate_hipaa"),
  data: z.record(z.any()).optional(),
});

export const CalculateVATSchema = z.object({
  operation: z.literal("calculate_vat"),
  items: z.array(
    z.object({
      description: z.string().min(1),
      amount: z.number().nonnegative(),
      vatExempt: z.boolean().optional(),
      category: z.string().optional(),
    })
  ).min(1),
});

export const SecurityReportSchema = z.object({
  operation: z.literal("security_report"),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const ComplianceMonitoringSchema = z.object({
  operation: z.literal("compliance_monitoring"),
  interval: z.number().positive().optional(),
  thresholds: z
    .object({
      critical: z.number().min(0).max(100).optional(),
      high: z.number().min(0).max(100).optional(),
      medium: z.number().min(0).max(100).optional(),
    })
    .optional(),
  alertMethods: z.array(z.enum(["email", "dashboard"]).or(z.string())).optional(),
});

export const SecurityOperationSchema = z.discriminatedUnion("operation", [
  ComprehensiveAssessmentSchema,
  EncryptPHISchema,
  DecryptPHISchema,
  ValidateNPHIESSchema,
  ValidateHIPAASchema,
  CalculateVATSchema,
  SecurityReportSchema,
  ComplianceMonitoringSchema,
]);

