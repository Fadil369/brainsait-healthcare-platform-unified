import { z } from "zod";

export const CurrencySchema = z.enum(["SAR", "USD"]);

export const PaymentMetadataSchema = z.object({
  serviceDate: z.string().min(1),
  diagnosisCode: z.string().min(1),
  procedureCode: z.string().min(1),
  providerLicense: z.string().min(1),
  patientConsent: z.boolean(),
});

export const ProcessPaymentSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1),
  providerId: z.string().min(1),
  amount: z.number().positive(),
  currency: CurrencySchema,
  description: z.string().min(1),
  serviceCode: z.string().min(1),
  claimId: z.string().optional(),
  nphiesReference: z.string().optional(),
  hipaaCompliant: z.boolean().default(true),
  metadata: PaymentMetadataSchema,
});

export const ClaimSchema = z.object({
  claimId: z.string().min(1),
  patientId: z.string().min(1),
  providerId: z.string().min(1),
  totalAmount: z.number().positive(),
  primaryServiceCode: z.string().min(1),
  primaryDiagnosis: z.string().min(1),
  primaryProcedure: z.string().min(1),
  providerLicense: z.string().min(1),
  serviceDate: z.string().optional(),
  submitToNPHIES: z.boolean().optional(),
});

export const WorkflowIntegrationSchema = z.object({
  workflowType: z.enum([
    "appointment_payment",
    "insurance_claim",
    "prescription_payment",
    "emergency_payment",
  ]),
  workflowData: z.record(z.any()),
});

export const TreasuryCreateAccountSchema = z.object({
  providerId: z.string().min(1),
  organizationData: z.object({
    name: z.string().min(1),
    licenseNumber: z.string().min(1),
    nphiesId: z.string().optional(),
    mohRegistration: z.string().optional(),
  }),
});

export const TreasuryOperationSchema = z.object({
  operation: z.enum(["transfer", "payment", "balance_check", "transaction_history"]),
  params: z.record(z.any()),
});

export const CardIssueSchema = z.object({
  cardholderName: z.string().min(1),
  patientId: z.string().min(1),
  type: z.enum(["hsa", "fsa", "insurance", "general_healthcare"]),
  spendingControls: z.object({
    categories: z.array(z.string()).min(1),
    maxAmount: z.number().positive(),
    interval: z.enum(["daily", "weekly", "monthly", "yearly"]),
  }),
  metadata: z.object({
    insuranceProvider: z.string().optional(),
    policyNumber: z.string().optional(),
    groupNumber: z.string().optional(),
    beneficiaryId: z.string().optional(),
  }),
});

export const FraudAnalyzeSchema = z.object({
  amount: z.number().positive(),
  patientId: z.string().optional(),
  providerId: z.string().optional(),
});

export const TimeRangeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export const ProviderRiskSchema = z.object({
  providerId: z.string().min(1),
});

