/**
 * Comprehensive Arabic Medical Terminology Module
 * Advanced medical terminology translation for Saudi healthcare market
 * Includes ICD-10, CPT, medication names, and cultural medical terms
 */

export interface MedicalTerm {
  english: string;
  arabic: string;
  pronunciation?: string; // Latin transliteration
  category: string;
  icd10Code?: string;
  cptCode?: string;
  synonyms?: {
    english: string[];
    arabic: string[];
  };
  culturalNotes?: string;
}

export interface MedicationTranslation {
  brandName: string;
  arabicBrandName: string;
  genericName: string;
  arabicGenericName: string;
  dosageForm: string;
  arabicDosageForm: string;
  strength: string;
  manufacturer: string;
  arabicManufacturer: string;
  therapeuticClass: string;
  arabicTherapeuticClass: string;
  sfdaRegistration: string;
}

export interface BodySystemTerminology {
  system: string;
  arabicSystem: string;
  organs: Array<{
    english: string;
    arabic: string;
    functions: Array<{
      english: string;
      arabic: string;
    }>;
  }>;
}

export class ArabicMedicalTerminologyEngine {
  private readonly MEDICAL_CONDITIONS: MedicalTerm[] = [
    // Cardiovascular Conditions
    {
      english: "Hypertension",
      arabic: "ارتفاع ضغط الدم",
      pronunciation: "irtifa'a dhaght al-dam",
      category: "cardiovascular",
      icd10Code: "I10",
      synonyms: {
        english: ["High blood pressure", "HTN"],
        arabic: ["ضغط الدم المرتفع", "فرط ضغط الدم"]
      },
      culturalNotes: "Common condition in Saudi population, often related to lifestyle factors"
    },
    {
      english: "Myocardial Infarction",
      arabic: "احتشاء عضلة القلب",
      pronunciation: "ihtisha'a 'adhalat al-qalb",
      category: "cardiovascular",
      icd10Code: "I21",
      synonyms: {
        english: ["Heart attack", "MI"],
        arabic: ["جلطة القلب", "نوبة قلبية"]
      }
    },
    {
      english: "Atrial Fibrillation",
      arabic: "الرجفان الأذيني",
      pronunciation: "al-rajafan al-udhuni",
      category: "cardiovascular",
      icd10Code: "I48",
      synonyms: {
        english: ["AFib", "AF"],
        arabic: ["رجفان أذيني"]
      }
    },

    // Respiratory Conditions
    {
      english: "Asthma",
      arabic: "الربو",
      pronunciation: "al-rabw",
      category: "respiratory",
      icd10Code: "J45",
      synonyms: {
        english: ["Bronchial asthma"],
        arabic: ["الربو الشعبي", "ضيق التنفس المزمن"]
      },
      culturalNotes: "Prevalence influenced by dust storms and climate in Saudi Arabia"
    },
    {
      english: "Pneumonia",
      arabic: "الالتهاب الرئوي",
      pronunciation: "al-iltihab al-ri'awi",
      category: "respiratory",
      icd10Code: "J18",
      synonyms: {
        english: ["Lung infection"],
        arabic: ["التهاب الرئة", "عدوى الرئة"]
      }
    },
    {
      english: "Chronic Obstructive Pulmonary Disease",
      arabic: "مرض الانسداد الرئوي المزمن",
      pronunciation: "maradh al-insidad al-ri'awi al-muzmin",
      category: "respiratory",
      icd10Code: "J44",
      synonyms: {
        english: ["COPD"],
        arabic: ["الانسداد الرئوي المزمن"]
      }
    },

    // Endocrine Conditions
    {
      english: "Diabetes Mellitus Type 2",
      arabic: "داء السكري من النوع الثاني",
      pronunciation: "da'a al-sukkari min al-naw'a al-thani",
      category: "endocrine",
      icd10Code: "E11",
      synonyms: {
        english: ["Type 2 diabetes", "T2DM", "Adult-onset diabetes"],
        arabic: ["السكري النوع الثاني", "سكري البالغين"]
      },
      culturalNotes: "High prevalence in Saudi population, related to lifestyle and genetic factors"
    },
    {
      english: "Diabetes Mellitus Type 1",
      arabic: "داء السكري من النوع الأول",
      pronunciation: "da'a al-sukkari min al-naw'a al-awwal",
      category: "endocrine",
      icd10Code: "E10",
      synonyms: {
        english: ["Type 1 diabetes", "T1DM", "Juvenile diabetes"],
        arabic: ["السكري النوع الأول", "سكري الأطفال"]
      }
    },
    {
      english: "Thyroid Disorders",
      arabic: "اضطرابات الغدة الدرقية",
      pronunciation: "idhtirabaaat al-ghudda al-daraqiyya",
      category: "endocrine",
      icd10Code: "E07",
      synonyms: {
        english: ["Thyroid dysfunction"],
        arabic: ["خلل الغدة الدرقية"]
      }
    },

    // Gastrointestinal Conditions
    {
      english: "Gastroesophageal Reflux Disease",
      arabic: "مرض الارتجاع المعدي المريئي",
      pronunciation: "maradh al-irtija'a al-ma'adi al-mari'i",
      category: "gastrointestinal",
      icd10Code: "K21",
      synonyms: {
        english: ["GERD", "Acid reflux"],
        arabic: ["ارتجاع المعدة", "حرقة المعدة"]
      }
    },
    {
      english: "Inflammatory Bowel Disease",
      arabic: "مرض التهاب الأمعاء",
      pronunciation: "maradh iltihab al-am'aa",
      category: "gastrointestinal",
      icd10Code: "K50",
      synonyms: {
        english: ["IBD"],
        arabic: ["التهاب الأمعاء"]
      }
    },

    // Neurological Conditions
    {
      english: "Migraine",
      arabic: "الصداع النصفي",
      pronunciation: "al-suda'a al-nisfi",
      category: "neurological",
      icd10Code: "G43",
      synonyms: {
        english: ["Migraine headache"],
        arabic: ["الشقيقة", "نصف الرأس"]
      }
    },
    {
      english: "Epilepsy",
      arabic: "الصرع",
      pronunciation: "al-sara'a",
      category: "neurological",
      icd10Code: "G40",
      synonyms: {
        english: ["Seizure disorder"],
        arabic: ["اضطراب النوبات"]
      }
    },

    // Infectious Diseases
    {
      english: "COVID-19",
      arabic: "كوفيد-19",
      pronunciation: "kufid tisa'ashar",
      category: "infectious",
      icd10Code: "U07.1",
      synonyms: {
        english: ["Coronavirus disease 2019", "SARS-CoV-2"],
        arabic: ["فيروس كورونا", "كورونا المستجد"]
      }
    },
    {
      english: "Tuberculosis",
      arabic: "السل",
      pronunciation: "al-sill",
      category: "infectious",
      icd10Code: "A15",
      synonyms: {
        english: ["TB"],
        arabic: ["الدرن"]
      }
    }
  ];

  private readonly MEDICAL_PROCEDURES: MedicalTerm[] = [
    {
      english: "Electrocardiogram",
      arabic: "تخطيط كهربية القلب",
      pronunciation: "takhtet kahrabiyyat al-qalb",
      category: "diagnostic",
      cptCode: "93000",
      synonyms: {
        english: ["ECG", "EKG"],
        arabic: ["رسم القلب"]
      }
    },
    {
      english: "Computed Tomography",
      arabic: "التصوير المقطعي المحوسب",
      pronunciation: "al-taswir al-maqta'i al-mahwasab",
      category: "imaging",
      cptCode: "74150",
      synonyms: {
        english: ["CT scan", "CAT scan"],
        arabic: ["الأشعة المقطعية", "سي تي سكان"]
      }
    },
    {
      english: "Magnetic Resonance Imaging",
      arabic: "التصوير بالرنين المغناطيسي",
      pronunciation: "al-taswir bil-ranin al-maghnatisi",
      category: "imaging",
      cptCode: "70551",
      synonyms: {
        english: ["MRI"],
        arabic: ["الرنين المغناطيسي", "إم آر آي"]
      }
    },
    {
      english: "Ultrasound",
      arabic: "الموجات فوق الصوتية",
      pronunciation: "al-mawjaat fawq al-sawtiyya",
      category: "imaging",
      cptCode: "76700",
      synonyms: {
        english: ["Sonography", "Echo"],
        arabic: ["السونار", "الإيكو"]
      }
    },
    {
      english: "Blood Test",
      arabic: "فحص الدم",
      pronunciation: "fahs al-dam",
      category: "laboratory",
      cptCode: "80053",
      synonyms: {
        english: ["Blood work", "Lab test"],
        arabic: ["تحليل الدم", "فحوصات مخبرية"]
      }
    }
  ];

  private readonly BODY_SYSTEMS: BodySystemTerminology[] = [
    {
      system: "Cardiovascular System",
      arabicSystem: "الجهاز القلبي الوعائي",
      organs: [
        {
          english: "Heart",
          arabic: "القلب",
          functions: [
            { english: "Pumping blood", arabic: "ضخ الدم" },
            { english: "Circulation", arabic: "الدورة الدموية" }
          ]
        },
        {
          english: "Blood vessels",
          arabic: "الأوعية الدموية",
          functions: [
            { english: "Blood transport", arabic: "نقل الدم" },
            { english: "Pressure regulation", arabic: "تنظيم الضغط" }
          ]
        }
      ]
    },
    {
      system: "Respiratory System",
      arabicSystem: "الجهاز التنفسي",
      organs: [
        {
          english: "Lungs",
          arabic: "الرئتان",
          functions: [
            { english: "Gas exchange", arabic: "تبادل الغازات" },
            { english: "Oxygen intake", arabic: "أخذ الأكسجين" }
          ]
        },
        {
          english: "Trachea",
          arabic: "القصبة الهوائية",
          functions: [
            { english: "Air passage", arabic: "مجرى الهواء" }
          ]
        }
      ]
    },
    {
      system: "Digestive System",
      arabicSystem: "الجهاز الهضمي",
      organs: [
        {
          english: "Stomach",
          arabic: "المعدة",
          functions: [
            { english: "Food digestion", arabic: "هضم الطعام" },
            { english: "Acid production", arabic: "إنتاج الحمض" }
          ]
        },
        {
          english: "Liver",
          arabic: "الكبد",
          functions: [
            { english: "Detoxification", arabic: "إزالة السموم" },
            { english: "Metabolism", arabic: "الأيض" }
          ]
        }
      ]
    }
  ];

  private readonly COMMON_MEDICATIONS: MedicationTranslation[] = [
    {
      brandName: "Panadol",
      arabicBrandName: "بنادول",
      genericName: "Paracetamol",
      arabicGenericName: "باراسيتامول",
      dosageForm: "Tablet",
      arabicDosageForm: "قرص",
      strength: "500mg",
      manufacturer: "GSK",
      arabicManufacturer: "جي إس كي",
      therapeuticClass: "Analgesic",
      arabicTherapeuticClass: "مسكن للألم",
      sfdaRegistration: "SFDA-001234"
    },
    {
      brandName: "Augmentin",
      arabicBrandName: "أوجمنتين",
      genericName: "Amoxicillin/Clavulanate",
      arabicGenericName: "أموكسيسيلين/كلافولانات",
      dosageForm: "Tablet",
      arabicDosageForm: "قرص",
      strength: "625mg",
      manufacturer: "GSK",
      arabicManufacturer: "جي إس كي",
      therapeuticClass: "Antibiotic",
      arabicTherapeuticClass: "مضاد حيوي",
      sfdaRegistration: "SFDA-005678"
    },
    {
      brandName: "Glucophage",
      arabicBrandName: "جلوكوفاج",
      genericName: "Metformin",
      arabicGenericName: "ميتفورمين",
      dosageForm: "Tablet",
      arabicDosageForm: "قرص",
      strength: "500mg",
      manufacturer: "Merck",
      arabicManufacturer: "ميرك",
      therapeuticClass: "Antidiabetic",
      arabicTherapeuticClass: "مضاد السكري",
      sfdaRegistration: "SFDA-009012"
    }
  ];

  private readonly CULTURAL_MEDICAL_TERMS = {
    // Traditional Arabic medicine terms
    "Traditional Medicine": "الطب الشعبي",
    "Herbal Treatment": "العلاج بالأعشاب",
    "Cupping": "الحجامة",
    "Cauterization": "الكي",
    "Traditional Healer": "المعالج الشعبي",
    
    // Religious and cultural considerations
    "Prayer Time": "وقت الصلاة",
    "Fasting": "الصيام",
    "Pilgrimage": "الحج",
    "Ritual Cleanliness": "الطهارة",
    "Modesty Requirements": "متطلبات العفة",
    
    // Family structure terms
    "Extended Family": "العائلة الممتدة",
    "Family Decision": "قرار العائلة",
    "Elder Consultation": "استشارة كبار السن",
    "Gender Preferences": "تفضيلات الجنس",
    
    // Saudi-specific health programs
    "Mawid Platform": "منصة موعد",
    "Seha App": "تطبيق صحة",
    "Health Cluster": "التجمع الصحي",
    "Vision 2030": "رؤية 2030"
  };

  // Translate medical term from English to Arabic
  translateTerm(englishTerm: string, category?: string): string {
    const normalizedTerm = englishTerm.toLowerCase().trim();
    
    // Search in medical conditions
    const condition = this.MEDICAL_CONDITIONS.find(term => 
      term.english.toLowerCase() === normalizedTerm ||
      term.synonyms?.english.some(syn => syn.toLowerCase() === normalizedTerm)
    );
    if (condition) return condition.arabic;

    // Search in medical procedures
    const procedure = this.MEDICAL_PROCEDURES.find(term => 
      term.english.toLowerCase() === normalizedTerm ||
      term.synonyms?.english.some(syn => syn.toLowerCase() === normalizedTerm)
    );
    if (procedure) return procedure.arabic;

    // Search in cultural terms
    const culturalTerm = Object.entries(this.CULTURAL_MEDICAL_TERMS).find(
      ([english]) => english.toLowerCase() === normalizedTerm
    );
    if (culturalTerm) return culturalTerm[1];

    // Return original term if no translation found
    return englishTerm;
  }

  // Translate medical term from Arabic to English
  translateFromArabic(arabicTerm: string): string {
    const normalizedTerm = arabicTerm.trim();
    
    // Search in medical conditions
    const condition = this.MEDICAL_CONDITIONS.find(term => 
      term.arabic === normalizedTerm ||
      term.synonyms?.arabic.some(syn => syn === normalizedTerm)
    );
    if (condition) return condition.english;

    // Search in medical procedures
    const procedure = this.MEDICAL_PROCEDURES.find(term => 
      term.arabic === normalizedTerm ||
      term.synonyms?.arabic.some(syn => syn === normalizedTerm)
    );
    if (procedure) return procedure.english;

    // Search in cultural terms
    const culturalTerm = Object.entries(this.CULTURAL_MEDICAL_TERMS).find(
      ([, arabic]) => arabic === normalizedTerm
    );
    if (culturalTerm) return culturalTerm[0];

    // Return original term if no translation found
    return arabicTerm;
  }

  // Get detailed medical term information
  getTermDetails(term: string): MedicalTerm | null {
    const normalizedTerm = term.toLowerCase().trim();
    
    return this.MEDICAL_CONDITIONS.find(medTerm => 
      medTerm.english.toLowerCase() === normalizedTerm ||
      medTerm.arabic === term ||
      medTerm.synonyms?.english.some(syn => syn.toLowerCase() === normalizedTerm) ||
      medTerm.synonyms?.arabic.some(syn => syn === term)
    ) || 
    this.MEDICAL_PROCEDURES.find(medTerm => 
      medTerm.english.toLowerCase() === normalizedTerm ||
      medTerm.arabic === term ||
      medTerm.synonyms?.english.some(syn => syn.toLowerCase() === normalizedTerm) ||
      medTerm.synonyms?.arabic.some(syn => syn === term)
    ) || null;
  }

  // Get medication translation
  getMedicationTranslation(medicationName: string): MedicationTranslation | null {
    return this.COMMON_MEDICATIONS.find(med => 
      med.brandName.toLowerCase() === medicationName.toLowerCase() ||
      med.arabicBrandName === medicationName ||
      med.genericName.toLowerCase() === medicationName.toLowerCase() ||
      med.arabicGenericName === medicationName
    ) || null;
  }

  // Get body system terminology
  getBodySystemTerminology(systemName: string): BodySystemTerminology | null {
    return this.BODY_SYSTEMS.find(system => 
      system.system.toLowerCase() === systemName.toLowerCase() ||
      system.arabicSystem === systemName
    ) || null;
  }

  // Get terms by category
  getTermsByCategory(category: string): MedicalTerm[] {
    return [...this.MEDICAL_CONDITIONS, ...this.MEDICAL_PROCEDURES]
      .filter(term => term.category === category);
  }

  // Get all categories
  getCategories(): string[] {
    const categories = new Set<string>();
    [...this.MEDICAL_CONDITIONS, ...this.MEDICAL_PROCEDURES]
      .forEach(term => categories.add(term.category));
    return Array.from(categories);
  }

  // Search terms (fuzzy matching)
  searchTerms(query: string, language: 'en' | 'ar' = 'en'): MedicalTerm[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return [...this.MEDICAL_CONDITIONS, ...this.MEDICAL_PROCEDURES]
      .filter(term => {
        if (language === 'en') {
          return term.english.toLowerCase().includes(normalizedQuery) ||
                 term.synonyms?.english.some(syn => 
                   syn.toLowerCase().includes(normalizedQuery)
                 );
        } else {
          return term.arabic.includes(query) ||
                 term.synonyms?.arabic.some(syn => syn.includes(query));
        }
      });
  }

  // Get pronunciation guide
  getPronunciation(term: string): string | null {
    const termDetails = this.getTermDetails(term);
    return termDetails?.pronunciation || null;
  }

  // Get cultural notes
  getCulturalNotes(term: string): string | null {
    const termDetails = this.getTermDetails(term);
    return termDetails?.culturalNotes || null;
  }

  // Get ICD-10 code for condition
  getICD10Code(condition: string): string | null {
    const termDetails = this.getTermDetails(condition);
    return termDetails?.icd10Code || null;
  }

  // Get CPT code for procedure
  getCPTCode(procedure: string): string | null {
    const termDetails = this.getTermDetails(procedure);
    return termDetails?.cptCode || null;
  }

  // Generate bilingual medical report
  generateBilingualReport(data: {
    patientName: { en: string; ar: string };
    conditions: string[];
    procedures: string[];
    medications: string[];
  }): {
    english: string;
    arabic: string;
  } {
    const translatedConditions = data.conditions.map(condition => ({
      en: condition,
      ar: this.translateTerm(condition)
    }));

    const translatedProcedures = data.procedures.map(procedure => ({
      en: procedure,
      ar: this.translateTerm(procedure)
    }));

    const translatedMedications = data.medications.map(medication => {
      const medTranslation = this.getMedicationTranslation(medication);
      return {
        en: medication,
        ar: medTranslation?.arabicBrandName || this.translateTerm(medication)
      };
    });

    const englishReport = `
Medical Report for ${data.patientName.en}

Conditions:
${translatedConditions.map(c => `- ${c.en}`).join('\n')}

Procedures:
${translatedProcedures.map(p => `- ${p.en}`).join('\n')}

Medications:
${translatedMedications.map(m => `- ${m.en}`).join('\n')}
    `.trim();

    const arabicReport = `
التقرير الطبي للمريض ${data.patientName.ar}

الحالات المرضية:
${translatedConditions.map(c => `- ${c.ar}`).join('\n')}

الإجراءات الطبية:
${translatedProcedures.map(p => `- ${p.ar}`).join('\n')}

الأدوية:
${translatedMedications.map(m => `- ${m.ar}`).join('\n')}
    `.trim();

    return {
      english: englishReport,
      arabic: arabicReport
    };
  }

  // Validate medical terminology consistency
  validateTerminologyConsistency(text: string, language: 'en' | 'ar'): {
    isConsistent: boolean;
    suggestions: Array<{
      original: string;
      suggested: string;
      reason: string;
    }>;
  } {
    const suggestions: Array<{
      original: string;
      suggested: string;
      reason: string;
    }> = [];

    // Simple validation - this could be expanded with more sophisticated NLP
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[.,!?;]/, '');
      const termDetails = this.getTermDetails(cleanWord);
      
      if (termDetails && language === 'en' && termDetails.arabic) {
        if (text.includes(termDetails.arabic)) {
          suggestions.push({
            original: cleanWord,
            suggested: termDetails.english,
            reason: 'Mixed language detected - use consistent terminology'
          });
        }
      }
    });

    return {
      isConsistent: suggestions.length === 0,
      suggestions
    };
  }
}