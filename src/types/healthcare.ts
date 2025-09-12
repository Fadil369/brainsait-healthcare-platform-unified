import { z } from 'zod';

export interface Patient {
  readonly id: string;
  readonly nationalId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: Date;
  readonly gender: 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';
  readonly contactInfo: ContactInfo;
  readonly medicalHistory?: EncryptedMedicalData;
}

export interface ContactInfo {
  readonly email?: string;
  readonly phone?: string;
  readonly address?: Address;
}

export interface Address {
  readonly street: string;
  readonly city: string;
  readonly province: string;
  readonly postalCode: string;
  readonly country: string;
}

export interface EncryptedMedicalData {
  readonly encryptedData: string;
  readonly keyId: string;
  readonly algorithm: 'AES-256-GCM';
  readonly timestamp: Date;
}

export interface FHIRResource {
  readonly resourceType: string;
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
    readonly lastUpdated?: string;
  };
}

// Strict validation schemas
export const PatientSchema = z.object({
  id: z.string().uuid(),
  nationalId: z.string().regex(/^\d{10}$/), // Saudi National ID format
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.date().max(new Date()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']),
});

export const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+966\d{9}$/).optional(), // Saudi phone format
  address: z.object({
    street: z.string().min(1).max(100),
    city: z.string().min(1).max(50),
    province: z.string().min(1).max(50),
    postalCode: z.string().regex(/^\d{5}$/),
    country: z.literal('SA'),
  }).optional(),
});

export const EncryptedMedicalDataSchema = z.object({
  encryptedData: z.string().min(1),
  keyId: z.string().uuid(),
  algorithm: z.literal('AES-256-GCM'),
  timestamp: z.date(),
});

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

export function validatePatient(data: unknown): ValidationResult<Patient> {
  try {
    const result = PatientSchema.parse(data);
    return { success: true, data: result as Patient };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}
