/**
 * Saudi Market-Specific Validation and Error Handling System
 * Comprehensive validation for Saudi healthcare platform
 * Includes NPHIES, MOH, cultural, and regulatory validations
 */

export interface ValidationRule {
  id: string;
  name: string;
  arabicName: string;
  category:
    | "nphies"
    | "moh"
    | "cultural"
    | "regulatory"
    | "business"
    | "technical";
  severity: "error" | "warning" | "info";
  description: string;
  arabicDescription: string;
  validator: (data: any) => ValidationResult;
  autoFix?: (data: any) => any;
}

export interface ValidationResult {
  valid: boolean;
  messages: ValidationMessage[];
  suggestedFixes: SuggestedFix[];
  culturalNotes?: string[];
}

export interface ValidationMessage {
  type: "error" | "warning" | "info" | "success";
  code: string;
  message: string;
  arabicMessage: string;
  field?: string;
  value?: any;
  expectedValue?: any;
  culturalContext?: string;
}

export interface SuggestedFix {
  id: string;
  description: string;
  arabicDescription: string;
  action: "replace" | "add" | "remove" | "modify";
  field: string;
  currentValue: any;
  suggestedValue: any;
  confidence: number;
  automatic: boolean;
}

export interface SaudiValidationContext {
  locale: "ar" | "en";
  region: string;
  userRole: "doctor" | "nurse" | "admin" | "patient" | "pharmacist";
  facility: {
    type: "hospital" | "clinic" | "pharmacy" | "laboratory";
    accreditation: string[];
    region: string;
  };
  culturalProfile?: {
    religiosity: "high" | "medium" | "low";
    traditionalism: "high" | "medium" | "low";
  };
}

export class SaudiValidationEngine {
  private readonly VALIDATION_RULES: ValidationRule[] = [
    // NPHIES Validation Rules
    {
      id: "NPHIES_001",
      name: "National ID Format",
      arabicName: "تنسيق الهوية الوطنية",
      category: "nphies",
      severity: "error",
      description: "Saudi National ID must be 10 digits",
      arabicDescription: "يجب أن تكون الهوية الوطنية السعودية 10 أرقام",
      validator: (data) => this.validateNationalId(data.nationalId),
      autoFix: (data) => this.autoFixNationalId(data.nationalId),
    },
    {
      id: "NPHIES_002",
      name: "Iqama Number Format",
      arabicName: "تنسيق رقم الإقامة",
      category: "nphies",
      severity: "error",
      description: "Iqama number must be 10 digits starting with 1 or 2",
      arabicDescription: "يجب أن يكون رقم الإقامة 10 أرقام يبدأ بـ 1 أو 2",
      validator: (data) => this.validateIqamaNumber(data.iqamaNumber),
    },
    {
      id: "NPHIES_003",
      name: "Provider License Validation",
      arabicName: "التحقق من ترخيص مقدم الخدمة",
      category: "nphies",
      severity: "error",
      description: "Healthcare provider must have valid MOH license",
      arabicDescription:
        "يجب أن يكون لدى مقدم الرعاية الصحية ترخيص ساري من وزارة الصحة",
      validator: (data) => this.validateProviderLicense(data.providerLicense),
    },
    {
      id: "NPHIES_004",
      name: "Service Date Range",
      arabicName: "نطاق تاريخ الخدمة",
      category: "nphies",
      severity: "warning",
      description:
        "Service date should be within last 365 days for optimal processing",
      arabicDescription:
        "يجب أن يكون تاريخ الخدمة خلال آخر 365 يوماً للمعالجة المثلى",
      validator: (data) => this.validateServiceDate(data.serviceDate),
    },

    // MOH Validation Rules
    {
      id: "MOH_001",
      name: "Medical Coding Standards",
      arabicName: "معايير الترميز الطبي",
      category: "moh",
      severity: "error",
      description: "Must use standardized ICD-10 and CPT codes",
      arabicDescription: "يجب استخدام رموز ICD-10 و CPT المعيارية",
      validator: (data) =>
        this.validateMedicalCoding(data.diagnosisCodes, data.procedureCodes),
    },
    {
      id: "MOH_002",
      name: "Facility Accreditation",
      arabicName: "اعتماد المنشأة",
      category: "moh",
      severity: "warning",
      description: "Facility should have CBAHI or equivalent accreditation",
      arabicDescription:
        "يجب أن تحصل المنشأة على اعتماد المجلس المركزي أو ما يعادله",
      validator: (data) =>
        this.validateFacilityAccreditation(data.facilityAccreditation),
    },
    {
      id: "MOH_003",
      name: "Medication Registration",
      arabicName: "تسجيل الدواء",
      category: "moh",
      severity: "error",
      description: "Medications must be registered with SFDA",
      arabicDescription:
        "يجب أن تكون الأدوية مسجلة لدى الهيئة العامة للغذاء والدواء",
      validator: (data) =>
        this.validateMedicationRegistration(data.medications),
    },

    // Cultural Validation Rules
    {
      id: "CULTURAL_001",
      name: "Prayer Time Consideration",
      arabicName: "مراعاة أوقات الصلاة",
      category: "cultural",
      severity: "warning",
      description: "Appointment times should consider prayer schedule",
      arabicDescription: "يجب مراعاة أوقات الصلاة عند تحديد المواعيد",
      validator: (data) =>
        this.validatePrayerTimeConsideration(data.appointmentTime),
    },
    {
      id: "CULTURAL_002",
      name: "Gender Preference Respect",
      arabicName: "احترام تفضيل الجنس",
      category: "cultural",
      severity: "info",
      description: "Check if gender preferences are accommodated",
      arabicDescription: "التحقق من مراعاة تفضيلات الجنس",
      validator: (data) =>
        this.validateGenderPreferences(
          data.patientGender,
          data.providerGender,
          data.genderPreference
        ),
    },
    {
      id: "CULTURAL_003",
      name: "Ramadan Schedule Adjustment",
      arabicName: "تعديل جدول رمضان",
      category: "cultural",
      severity: "info",
      description:
        "Consider Ramadan fasting schedule for appointments and medications",
      arabicDescription: "مراعاة جدول الصيام في رمضان للمواعيد والأدوية",
      validator: (data) =>
        this.validateRamadanConsiderations(
          data.appointmentDate,
          data.medicationSchedule
        ),
    },

    // Regulatory Validation Rules
    {
      id: "REG_001",
      name: "ZATCA VAT Compliance",
      arabicName: "الامتثال لضريبة القيمة المضافة",
      category: "regulatory",
      severity: "error",
      description: "VAT calculation must comply with ZATCA regulations",
      arabicDescription:
        "يجب أن يتوافق حساب ضريبة القيمة المضافة مع أنظمة الهيئة",
      validator: (data) => this.validateVATCompliance(data.billingItems),
    },
    {
      id: "REG_002",
      name: "E-Invoicing Requirement",
      arabicName: "متطلبات الفوترة الإلكترونية",
      category: "regulatory",
      severity: "error",
      description: "E-invoicing is mandatory for healthcare providers",
      arabicDescription: "الفوترة الإلكترونية إلزامية لمقدمي الرعاية الصحية",
      validator: (data) => this.validateEInvoicingCompliance(data.invoiceData),
    },

    // Business Rules
    {
      id: "BUSINESS_001",
      name: "Insurance Coverage Validation",
      arabicName: "التحقق من التغطية التأمينية",
      category: "business",
      severity: "warning",
      description: "Verify insurance coverage for requested services",
      arabicDescription: "التحقق من التغطية التأمينية للخدمات المطلوبة",
      validator: (data) =>
        this.validateInsuranceCoverage(
          data.insuranceInfo,
          data.requestedServices
        ),
    },
    {
      id: "BUSINESS_002",
      name: "Pre-authorization Check",
      arabicName: "فحص الموافقة المسبقة",
      category: "business",
      severity: "error",
      description: "Certain services require pre-authorization",
      arabicDescription: "بعض الخدمات تتطلب موافقة مسبقة",
      validator: (data) =>
        this.validatePreauthorizationRequirement(data.serviceCodes),
    },
  ];

  private readonly ERROR_CODES: Record<string, { en: string; ar: string }> = {
    INVALID_NATIONAL_ID: {
      en: "Invalid National ID format",
      ar: "تنسيق الهوية الوطنية غير صحيح",
    },
    INVALID_IQAMA: {
      en: "Invalid Iqama number format",
      ar: "تنسيق رقم الإقامة غير صحيح",
    },
    EXPIRED_LICENSE: {
      en: "Healthcare provider license has expired",
      ar: "انتهت صلاحية ترخيص مقدم الرعاية الصحية",
    },
    INVALID_ICD10: {
      en: "Invalid ICD-10 diagnosis code",
      ar: "رمز التشخيص ICD-10 غير صحيح",
    },
    INVALID_CPT: {
      en: "Invalid CPT procedure code",
      ar: "رمز الإجراء CPT غير صحيح",
    },
    PRAYER_TIME_CONFLICT: {
      en: "Appointment conflicts with prayer time",
      ar: "الموعد يتعارض مع وقت الصلاة",
    },
    GENDER_PREFERENCE_NOT_MET: {
      en: "Gender preference not accommodated",
      ar: "لم يتم مراعاة تفضيل الجنس",
    },
    VAT_CALCULATION_ERROR: {
      en: "VAT calculation does not comply with ZATCA regulations",
      ar: "حساب ضريبة القيمة المضافة لا يتوافق مع أنظمة الهيئة",
    },
    MISSING_PREAUTH: {
      en: "Pre-authorization required for this service",
      ar: "الموافقة المسبقة مطلوبة لهذه الخدمة",
    },
    UNREGISTERED_MEDICATION: {
      en: "Medication not registered with SFDA",
      ar: "الدواء غير مسجل لدى الهيئة العامة للغذاء والدواء",
    },
  };

  // Main validation function
  validate(data: any, context: SaudiValidationContext): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];
    const culturalNotes: string[] = [];
    let isValid = true;

    // Apply relevant validation rules based on context
    const applicableRules = this.getApplicableRules(context);

    for (const rule of applicableRules) {
      try {
        const result = rule.validator(data);

        if (!result.valid) {
          if (rule.severity === "error") {
            isValid = false;
          }

          messages.push(...result.messages);
          suggestedFixes.push(...result.suggestedFixes);

          if (result.culturalNotes) {
            culturalNotes.push(...result.culturalNotes);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        messages.push({
          type: "error",
          code: "VALIDATION_ERROR",
          message: `Validation rule ${rule.id} failed: ${errorMessage}`,
          arabicMessage: `فشل في قاعدة التحقق ${rule.id}: ${errorMessage}`,
        });
        isValid = false;
      }
    }

    return {
      valid: isValid,
      messages,
      suggestedFixes,
      culturalNotes: culturalNotes.length > 0 ? culturalNotes : undefined,
    };
  }

  // Get applicable rules based on context
  private getApplicableRules(
    context: SaudiValidationContext
  ): ValidationRule[] {
    return this.VALIDATION_RULES.filter((rule) => {
      // Apply all rules by default, but could filter based on context
      return true;
    });
  }

  // Specific validation methods
  private validateNationalId(nationalId: string): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!nationalId) {
      messages.push({
        type: "error",
        code: "MISSING_NATIONAL_ID",
        message: "National ID is required",
        arabicMessage: "الهوية الوطنية مطلوبة",
        field: "nationalId",
      });
      return { valid: false, messages, suggestedFixes };
    }

    // Remove any non-digit characters
    const cleanId = nationalId.replace(/\D/g, "");

    if (cleanId.length !== 10) {
      messages.push({
        type: "error",
        code: "INVALID_NATIONAL_ID",
        message: this.ERROR_CODES.INVALID_NATIONAL_ID.en,
        arabicMessage: this.ERROR_CODES.INVALID_NATIONAL_ID.ar,
        field: "nationalId",
        value: nationalId,
        expectedValue: "10-digit number",
      });

      if (cleanId.length > 0) {
        suggestedFixes.push({
          id: "fix_national_id_length",
          description: "Pad with zeros or trim to 10 digits",
          arabicDescription: "إضافة أصفار أو تقليص إلى 10 أرقام",
          action: "replace",
          field: "nationalId",
          currentValue: nationalId,
          suggestedValue: cleanId.padStart(10, "0").substring(0, 10),
          confidence: 0.7,
          automatic: false,
        });
      }

      return { valid: false, messages, suggestedFixes };
    }

    // Saudi National ID validation algorithm
    if (!this.validateSaudiNationalIdChecksum(cleanId)) {
      messages.push({
        type: "error",
        code: "INVALID_NATIONAL_ID_CHECKSUM",
        message: "National ID checksum validation failed",
        arabicMessage: "فشل في التحقق من مجموع التحقق للهوية الوطنية",
        field: "nationalId",
        value: nationalId,
      });
      return { valid: false, messages, suggestedFixes };
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validateIqamaNumber(iqamaNumber: string): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!iqamaNumber) {
      messages.push({
        type: "error",
        code: "MISSING_IQAMA",
        message: "Iqama number is required",
        arabicMessage: "رقم الإقامة مطلوب",
        field: "iqamaNumber",
      });
      return { valid: false, messages, suggestedFixes };
    }

    const cleanIqama = iqamaNumber.replace(/\D/g, "");

    if (cleanIqama.length !== 10) {
      messages.push({
        type: "error",
        code: "INVALID_IQAMA",
        message: this.ERROR_CODES.INVALID_IQAMA.en,
        arabicMessage: this.ERROR_CODES.INVALID_IQAMA.ar,
        field: "iqamaNumber",
        value: iqamaNumber,
      });
      return { valid: false, messages, suggestedFixes };
    }

    if (!["1", "2"].includes(cleanIqama[0])) {
      messages.push({
        type: "error",
        code: "INVALID_IQAMA_PREFIX",
        message: "Iqama number must start with 1 or 2",
        arabicMessage: "يجب أن يبدأ رقم الإقامة بـ 1 أو 2",
        field: "iqamaNumber",
        value: iqamaNumber,
      });
      return { valid: false, messages, suggestedFixes };
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validateProviderLicense(providerLicense: any): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!providerLicense || !providerLicense.number) {
      messages.push({
        type: "error",
        code: "MISSING_PROVIDER_LICENSE",
        message: "Provider license number is required",
        arabicMessage: "رقم ترخيص مقدم الخدمة مطلوب",
        field: "providerLicense.number",
      });
      return { valid: false, messages, suggestedFixes };
    }

    if (providerLicense.expiryDate) {
      const expiryDate = new Date(providerLicense.expiryDate);
      const today = new Date();

      if (expiryDate < today) {
        messages.push({
          type: "error",
          code: "EXPIRED_LICENSE",
          message: this.ERROR_CODES.EXPIRED_LICENSE.en,
          arabicMessage: this.ERROR_CODES.EXPIRED_LICENSE.ar,
          field: "providerLicense.expiryDate",
          value: providerLicense.expiryDate,
        });
        return { valid: false, messages, suggestedFixes };
      }

      // Warning if expiring within 30 days
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 30) {
        messages.push({
          type: "warning",
          code: "LICENSE_EXPIRING_SOON",
          message: `License expires in ${daysUntilExpiry} days`,
          arabicMessage: `ينتهي الترخيص خلال ${daysUntilExpiry} يوماً`,
          field: "providerLicense.expiryDate",
          value: providerLicense.expiryDate,
        });
      }
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validateServiceDate(serviceDate: string): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!serviceDate) {
      messages.push({
        type: "error",
        code: "MISSING_SERVICE_DATE",
        message: "Service date is required",
        arabicMessage: "تاريخ الخدمة مطلوب",
        field: "serviceDate",
      });
      return { valid: false, messages, suggestedFixes };
    }

    const service = new Date(serviceDate);
    const today = new Date();
    const daysDifference = Math.ceil(
      (today.getTime() - service.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (service > today) {
      messages.push({
        type: "error",
        code: "FUTURE_SERVICE_DATE",
        message: "Service date cannot be in the future",
        arabicMessage: "لا يمكن أن يكون تاريخ الخدمة في المستقبل",
        field: "serviceDate",
        value: serviceDate,
      });
      return { valid: false, messages, suggestedFixes };
    }

    if (daysDifference > 365) {
      messages.push({
        type: "warning",
        code: "OLD_SERVICE_DATE",
        message:
          "Service date is more than 365 days old, may affect processing",
        arabicMessage: "تاريخ الخدمة أكثر من 365 يوماً، قد يؤثر على المعالجة",
        field: "serviceDate",
        value: serviceDate,
      });
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validateMedicalCoding(
    diagnosisCodes: string[],
    procedureCodes: string[]
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    // Validate ICD-10 codes
    if (diagnosisCodes && diagnosisCodes.length > 0) {
      const icd10Pattern = /^[A-Z]\d{2}(\.\d{1,3})?$/;
      const invalidICD10 = diagnosisCodes.filter(
        (code) => !icd10Pattern.test(code)
      );

      if (invalidICD10.length > 0) {
        messages.push({
          type: "error",
          code: "INVALID_ICD10",
          message: `${this.ERROR_CODES.INVALID_ICD10.en}: ${invalidICD10.join(
            ", "
          )}`,
          arabicMessage: `${
            this.ERROR_CODES.INVALID_ICD10.ar
          }: ${invalidICD10.join(", ")}`,
          field: "diagnosisCodes",
          value: invalidICD10,
        });
      }
    }

    // Validate CPT codes
    if (procedureCodes && procedureCodes.length > 0) {
      const cptPattern = /^\d{5}$/;
      const invalidCPT = procedureCodes.filter(
        (code) => !cptPattern.test(code)
      );

      if (invalidCPT.length > 0) {
        messages.push({
          type: "error",
          code: "INVALID_CPT",
          message: `${this.ERROR_CODES.INVALID_CPT.en}: ${invalidCPT.join(
            ", "
          )}`,
          arabicMessage: `${this.ERROR_CODES.INVALID_CPT.ar}: ${invalidCPT.join(
            ", "
          )}`,
          field: "procedureCodes",
          value: invalidCPT,
        });
      }
    }

    return {
      valid: messages.filter((m) => m.type === "error").length === 0,
      messages,
      suggestedFixes,
    };
  }

  private validatePrayerTimeConsideration(
    appointmentTime: string
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!appointmentTime) {
      return { valid: true, messages, suggestedFixes };
    }

    // Simplified prayer time check
    const time = appointmentTime.split("T")[1] || appointmentTime;
    const hour = parseInt(time.split(":")[0]);

    const prayerTimes = [5, 12, 15, 18, 20]; // Approximate prayer hours
    const isNearPrayerTime = prayerTimes.some(
      (prayerHour) => Math.abs(hour - prayerHour) < 1
    );

    if (isNearPrayerTime) {
      messages.push({
        type: "warning",
        code: "PRAYER_TIME_CONFLICT",
        message: this.ERROR_CODES.PRAYER_TIME_CONFLICT.en,
        arabicMessage: this.ERROR_CODES.PRAYER_TIME_CONFLICT.ar,
        field: "appointmentTime",
        value: appointmentTime,
        culturalContext: "Consider rescheduling to avoid prayer times",
      });

      // Suggest alternative times
      const nextSafeHour =
        prayerTimes.find((pt) => pt > hour + 1) || prayerTimes[0] + 24;
      const suggestedTime = appointmentTime.replace(
        /\d{2}:/,
        `${(nextSafeHour % 24).toString().padStart(2, "0")}:`
      );

      suggestedFixes.push({
        id: "adjust_prayer_time",
        description: "Adjust appointment to avoid prayer time",
        arabicDescription: "تعديل الموعد لتجنب وقت الصلاة",
        action: "replace",
        field: "appointmentTime",
        currentValue: appointmentTime,
        suggestedValue: suggestedTime,
        confidence: 0.8,
        automatic: false,
      });
    }

    return {
      valid: !isNearPrayerTime,
      messages,
      suggestedFixes,
      culturalNotes: isNearPrayerTime
        ? ["Appointment scheduled during prayer time may cause delays"]
        : undefined,
    };
  }

  private validateGenderPreferences(
    patientGender: string,
    providerGender: string,
    genderPreference: string
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (genderPreference && genderPreference !== "no_preference") {
      if (
        genderPreference === "same_gender" &&
        patientGender !== providerGender
      ) {
        messages.push({
          type: "info",
          code: "GENDER_PREFERENCE_NOT_MET",
          message: this.ERROR_CODES.GENDER_PREFERENCE_NOT_MET.en,
          arabicMessage: this.ERROR_CODES.GENDER_PREFERENCE_NOT_MET.ar,
          field: "providerGender",
          value: providerGender,
          expectedValue: patientGender,
          culturalContext: "Patient prefers same-gender healthcare provider",
        });

        suggestedFixes.push({
          id: "match_gender_preference",
          description: `Assign ${patientGender} healthcare provider`,
          arabicDescription: `تعيين مقدم رعاية صحية ${
            patientGender === "male" ? "ذكر" : "أنثى"
          }`,
          action: "replace",
          field: "providerGender",
          currentValue: providerGender,
          suggestedValue: patientGender,
          confidence: 0.9,
          automatic: false,
        });
      }
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validateRamadanConsiderations(
    appointmentDate: string,
    medicationSchedule: any
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    // Check if during Ramadan period (simplified)
    const date = new Date(appointmentDate);
    const currentYear = date.getFullYear();
    const ramadanStart = new Date(currentYear, 2, 15); // Approximate
    const ramadanEnd = new Date(currentYear, 3, 15); // Approximate

    if (date >= ramadanStart && date <= ramadanEnd) {
      messages.push({
        type: "info",
        code: "RAMADAN_CONSIDERATION",
        message:
          "Appointment scheduled during Ramadan - consider fasting schedule",
        arabicMessage: "الموعد محدد خلال رمضان - يرجى مراعاة جدول الصيام",
        field: "appointmentDate",
        value: appointmentDate,
        culturalContext: "Adjust timing for fasting patients",
      });
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validateVATCompliance(billingItems: any[]): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!billingItems || billingItems.length === 0) {
      return { valid: true, messages, suggestedFixes };
    }

    for (const item of billingItems) {
      if (typeof item.vatRate === "undefined") {
        messages.push({
          type: "error",
          code: "MISSING_VAT_RATE",
          message: "VAT rate is required for all billing items",
          arabicMessage: "معدل ضريبة القيمة المضافة مطلوب لجميع بنود الفاتورة",
          field: "billingItems.vatRate",
        });
      } else if (item.vatRate !== 0 && item.vatRate !== 0.15) {
        messages.push({
          type: "error",
          code: "VAT_CALCULATION_ERROR",
          message: this.ERROR_CODES.VAT_CALCULATION_ERROR.en,
          arabicMessage: this.ERROR_CODES.VAT_CALCULATION_ERROR.ar,
          field: "billingItems.vatRate",
          value: item.vatRate,
          expectedValue: "0 or 0.15",
        });
      }
    }

    return {
      valid: messages.filter((m) => m.type === "error").length === 0,
      messages,
      suggestedFixes,
    };
  }

  private validateEInvoicingCompliance(invoiceData: any): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    const requiredFields = [
      "sellerInfo",
      "buyerInfo",
      "invoiceNumber",
      "invoiceDate",
      "totalAmount",
    ];

    for (const field of requiredFields) {
      if (!invoiceData || !invoiceData[field]) {
        messages.push({
          type: "error",
          code: "MISSING_EINVOICE_FIELD",
          message: `${field} is required for e-invoicing compliance`,
          arabicMessage: `${field} مطلوب للامتثال للفوترة الإلكترونية`,
          field: `invoiceData.${field}`,
        });
      }
    }

    return {
      valid: messages.filter((m) => m.type === "error").length === 0,
      messages,
      suggestedFixes,
    };
  }

  private validateInsuranceCoverage(
    insuranceInfo: any,
    requestedServices: string[]
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    // Simplified insurance validation
    if (!insuranceInfo || !insuranceInfo.policyNumber) {
      messages.push({
        type: "warning",
        code: "MISSING_INSURANCE_INFO",
        message: "Insurance information is incomplete",
        arabicMessage: "معلومات التأمين غير مكتملة",
        field: "insuranceInfo",
      });
    }

    return { valid: true, messages, suggestedFixes };
  }

  private validatePreauthorizationRequirement(
    serviceCodes: string[]
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    // Services that typically require pre-authorization
    const preAuthRequired = ["MRI", "CT", "Surgery", "99214", "99215"];

    const needsPreAuth = serviceCodes.filter((code) =>
      preAuthRequired.some((required) => code.includes(required))
    );

    if (needsPreAuth.length > 0) {
      messages.push({
        type: "error",
        code: "MISSING_PREAUTH",
        message: `${this.ERROR_CODES.MISSING_PREAUTH.en}: ${needsPreAuth.join(
          ", "
        )}`,
        arabicMessage: `${
          this.ERROR_CODES.MISSING_PREAUTH.ar
        }: ${needsPreAuth.join(", ")}`,
        field: "preAuthorizationNumber",
      });
    }

    return {
      valid: needsPreAuth.length === 0,
      messages,
      suggestedFixes,
    };
  }

  private validateMedicationRegistration(medications: any[]): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!medications || medications.length === 0) {
      return { valid: true, messages, suggestedFixes };
    }

    for (const medication of medications) {
      if (!medication.sfdaRegistration) {
        messages.push({
          type: "error",
          code: "UNREGISTERED_MEDICATION",
          message: `${this.ERROR_CODES.UNREGISTERED_MEDICATION.en}: ${medication.name}`,
          arabicMessage: `${this.ERROR_CODES.UNREGISTERED_MEDICATION.ar}: ${medication.name}`,
          field: "medications.sfdaRegistration",
        });
      }
    }

    return {
      valid: messages.filter((m) => m.type === "error").length === 0,
      messages,
      suggestedFixes,
    };
  }

  private validateFacilityAccreditation(
    facilityAccreditation: string[]
  ): ValidationResult {
    const messages: ValidationMessage[] = [];
    const suggestedFixes: SuggestedFix[] = [];

    if (!facilityAccreditation || facilityAccreditation.length === 0) {
      messages.push({
        type: "warning",
        code: "NO_ACCREDITATION",
        message: "Facility has no accreditation on file",
        arabicMessage: "لا يوجد اعتماد للمنشأة في الملف",
        field: "facilityAccreditation",
      });
    }

    return { valid: true, messages, suggestedFixes };
  }

  // Helper methods
  private validateSaudiNationalIdChecksum(nationalId: string): boolean {
    // Simplified checksum validation - implement actual Saudi National ID algorithm
    const digits = nationalId.split("").map(Number);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }

    const checkDigit = (11 - (sum % 11)) % 11;
    return checkDigit === digits[9];
  }

  private autoFixNationalId(nationalId: string): any {
    if (!nationalId) return nationalId;

    const cleanId = nationalId.replace(/\D/g, "");
    if (cleanId.length < 10) {
      return cleanId.padStart(10, "0");
    } else if (cleanId.length > 10) {
      return cleanId.substring(0, 10);
    }

    return cleanId;
  }

  // Get validation rules
  getValidationRules(): ValidationRule[] {
    return this.VALIDATION_RULES;
  }

  // Get error codes
  getErrorCodes(): Record<string, { en: string; ar: string }> {
    return this.ERROR_CODES;
  }
}
