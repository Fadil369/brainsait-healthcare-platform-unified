/**
 * Enhanced Multi-Language Support for BrainSAIT Healthcare Platform
 * Optimized Arabic typography and RTL support
 */

export interface BilingualContent {
  en: string;
  ar: string;
}

export interface HealthcareTranslations {
  dashboard: BilingualContent;
  patients: BilingualContent;
  appointments: BilingualContent;
  claims: BilingualContent;
  reports: BilingualContent;
  settings: BilingualContent;
  logout: BilingualContent;
  // Medical terms
  diagnosis: BilingualContent;
  treatment: BilingualContent;
  prescription: BilingualContent;
  symptoms: BilingualContent;
  // NPHIES specific
  eligibility: BilingualContent;
  preauthorization: BilingualContent;
  claimSubmission: BilingualContent;
  // Status messages
  approved: BilingualContent;
  pending: BilingualContent;
  rejected: BilingualContent;
}

export const healthcareTranslations: HealthcareTranslations = {
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  patients: { en: 'Patients', ar: 'المرضى' },
  appointments: { en: 'Appointments', ar: 'المواعيد' },
  claims: { en: 'Claims', ar: 'المطالبات' },
  reports: { en: 'Reports', ar: 'التقارير' },
  settings: { en: 'Settings', ar: 'الإعدادات' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  diagnosis: { en: 'Diagnosis', ar: 'التشخيص' },
  treatment: { en: 'Treatment', ar: 'العلاج' },
  prescription: { en: 'Prescription', ar: 'الوصفة الطبية' },
  symptoms: { en: 'Symptoms', ar: 'الأعراض' },
  eligibility: { en: 'Eligibility Check', ar: 'فحص الأهلية' },
  preauthorization: { en: 'Pre-authorization', ar: 'الموافقة المسبقة' },
  claimSubmission: { en: 'Claim Submission', ar: 'تقديم المطالبة' },
  approved: { en: 'Approved', ar: 'موافق عليه' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  rejected: { en: 'Rejected', ar: 'مرفوض' }
};

export class EnhancedI18n {
  private locale: 'en' | 'ar' = 'en';
  
  constructor(initialLocale: 'en' | 'ar' = 'en') {
    this.locale = initialLocale;
  }

  setLocale(locale: 'en' | 'ar') {
    this.locale = locale;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    
    // Enhanced Arabic font loading
    if (locale === 'ar') {
      this.loadArabicFonts();
    }
  }

  t(key: keyof HealthcareTranslations): string {
    return healthcareTranslations[key][this.locale];
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.locale === 'ar' ? 'rtl' : 'ltr';
  }

  isRTL(): boolean {
    return this.locale === 'ar';
  }

  formatNumber(num: number): string {
    if (this.locale === 'ar') {
      return new Intl.NumberFormat('ar-SA').format(num);
    }
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatCurrency(amount: number, currency: string = 'SAR'): string {
    if (this.locale === 'ar') {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: currency
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date: Date): string {
    if (this.locale === 'ar') {
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  private loadArabicFonts() {
    // IBM Plex Sans Arabic - Primary font for Arabic healthcare content
    const ibmPlexArabic = document.createElement('link');
    ibmPlexArabic.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap';
    ibmPlexArabic.rel = 'stylesheet';
    document.head.appendChild(ibmPlexArabic);

    // Noto Sans Arabic - Fallback font
    const notoArabic = document.createElement('link');
    notoArabic.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap';
    notoArabic.rel = 'stylesheet';
    document.head.appendChild(notoArabic);
  }

  // Comprehensive Saudi healthcare medical terminology translation
  translateMedicalTerm(term: string): string {
    const medicalTerms: Record<string, BilingualContent> = {
      // Vital Signs
      'blood_pressure': { en: 'Blood Pressure', ar: 'ضغط الدم' },
      'heart_rate': { en: 'Heart Rate', ar: 'معدل ضربات القلب' },
      'temperature': { en: 'Temperature', ar: 'درجة الحرارة' },
      'pulse': { en: 'Pulse', ar: 'النبض' },
      'respiration_rate': { en: 'Respiration Rate', ar: 'معدل التنفس' },
      'oxygen_saturation': { en: 'Oxygen Saturation', ar: 'تشبع الأكسجين' },
      
      // Common Conditions
      'diabetes': { en: 'Diabetes', ar: 'مرض السكري' },
      'hypertension': { en: 'Hypertension', ar: 'ارتفاع ضغط الدم' },
      'asthma': { en: 'Asthma', ar: 'الربو' },
      'covid19': { en: 'COVID-19', ar: 'كوفيد-19' },
      'influenza': { en: 'Influenza', ar: 'الأنفلونزا' },
      'pneumonia': { en: 'Pneumonia', ar: 'الالتهاب الرئوي' },
      'cancer': { en: 'Cancer', ar: 'السرطان' },
      'migraine': { en: 'Migraine', ar: 'الصداع النصفي' },
      
      // Medications & Treatment
      'medication': { en: 'Medication', ar: 'الدواء' },
      'dosage': { en: 'Dosage', ar: 'الجرعة' },
      'prescription': { en: 'Prescription', ar: 'الوصفة الطبية' },
      'treatment': { en: 'Treatment', ar: 'العلاج' },
      'surgery': { en: 'Surgery', ar: 'الجراحة' },
      'therapy': { en: 'Therapy', ar: 'العلاج الطبيعي' },
      'injection': { en: 'Injection', ar: 'الحقنة' },
      'antibiotic': { en: 'Antibiotic', ar: 'مضاد حيوي' },
      
      // Body Systems
      'cardiovascular': { en: 'Cardiovascular', ar: 'القلب والأوعية الدموية' },
      'respiratory': { en: 'Respiratory', ar: 'الجهاز التنفسي' },
      'digestive': { en: 'Digestive', ar: 'الجهاز الهضمي' },
      'nervous': { en: 'Nervous System', ar: 'الجهاز العصبي' },
      'musculoskeletal': { en: 'Musculoskeletal', ar: 'الجهاز العضلي الهيكلي' },
      
      // Symptoms
      'pain': { en: 'Pain', ar: 'الألم' },
      'fever': { en: 'Fever', ar: 'الحمى' },
      'nausea': { en: 'Nausea', ar: 'الغثيان' },
      'fatigue': { en: 'Fatigue', ar: 'التعب' },
      'headache': { en: 'Headache', ar: 'الصداع' },
      'dizziness': { en: 'Dizziness', ar: 'الدوار' },
      'shortness_of_breath': { en: 'Shortness of Breath', ar: 'ضيق التنفس' },
      'chest_pain': { en: 'Chest Pain', ar: 'ألم الصدر' },
      
      // Allergies & Conditions
      'allergy': { en: 'Allergy', ar: 'الحساسية' },
      'food_allergy': { en: 'Food Allergy', ar: 'حساسية الطعام' },
      'drug_allergy': { en: 'Drug Allergy', ar: 'حساسية الدواء' },
      'chronic_condition': { en: 'Chronic Condition', ar: 'حالة مزمنة' },
      
      // NPHIES/MOH Specific Terms
      'preauthorization': { en: 'Pre-authorization', ar: 'الموافقة المسبقة' },
      'eligibility': { en: 'Eligibility', ar: 'الأهلية' },
      'coverage': { en: 'Coverage', ar: 'التغطية' },
      'copayment': { en: 'Copayment', ar: 'المشاركة في التكلفة' },
      'deductible': { en: 'Deductible', ar: 'المبلغ المقتطع' },
      'claim': { en: 'Claim', ar: 'المطالبة' },
      'reimbursement': { en: 'Reimbursement', ar: 'السداد' },
      'provider': { en: 'Healthcare Provider', ar: 'مقدم الرعاية الصحية' },
      
      // Saudi Healthcare System Terms
      'moh': { en: 'Ministry of Health', ar: 'وزارة الصحة' },
      'national_id': { en: 'National ID', ar: 'الهوية الوطنية' },
      'iqama': { en: 'Iqama', ar: 'الإقامة' },
      'medical_record': { en: 'Medical Record', ar: 'السجل الطبي' },
      'appointment': { en: 'Appointment', ar: 'الموعد' },
      'emergency': { en: 'Emergency', ar: 'الطوارئ' },
      'outpatient': { en: 'Outpatient', ar: 'العيادات الخارجية' },
      'inpatient': { en: 'Inpatient', ar: 'المرضى المقيمين' }
    };

    return medicalTerms[term]?.[this.locale] || term;
  }

  // Enhanced Arabic number formatting with Saudi conventions
  formatSaudiNumber(num: number): string {
    if (this.locale === 'ar') {
      // Use Arabic-Indic digits for Saudi market
      const arabicIndic = new Intl.NumberFormat('ar-SA-u-nu-arab').format(num);
      return arabicIndic;
    }
    return new Intl.NumberFormat('en-US').format(num);
  }

  // Saudi Riyal currency formatting with cultural context
  formatSaudiRiyal(amount: number): string {
    if (this.locale === 'ar') {
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR',
        currencyDisplay: 'symbol'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      currencyDisplay: 'code'
    }).format(amount);
  }

  // Hijri and Gregorian date support
  formatSaudiDate(date: Date, calendar: 'gregorian' | 'hijri' = 'gregorian'): string {
    if (this.locale === 'ar') {
      if (calendar === 'hijri') {
        // Use Islamic calendar for Arabic
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date);
      }
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  // RTL-aware text direction utilities
  getTextAlign(): 'left' | 'right' {
    return this.locale === 'ar' ? 'right' : 'left';
  }

  getFlexDirection(): 'row' | 'row-reverse' {
    return this.locale === 'ar' ? 'row-reverse' : 'row';
  }

  // Arabic typography utilities
  getArabicFontFamily(): string {
    return "'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Segoe UI Arabic', sans-serif";
  }

  getEnglishFontFamily(): string {
    return "'Inter', 'Segoe UI', 'Roboto', sans-serif";
  }

  getCurrentFontFamily(): string {
    return this.locale === 'ar' ? this.getArabicFontFamily() : this.getEnglishFontFamily();
  }
}

export const i18n = new EnhancedI18n();
