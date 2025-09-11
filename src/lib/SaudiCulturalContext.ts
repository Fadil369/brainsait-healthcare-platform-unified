/**
 * Saudi Cultural Context Awareness Module
 * Comprehensive cultural adaptation for Saudi healthcare workflows
 * Includes religious considerations, social customs, and cultural sensitivities
 */

export interface CulturalPreference {
  category: "religious" | "social" | "medical" | "communication" | "scheduling";
  preference: string;
  description: string;
  importance: "critical" | "high" | "medium" | "low";
  implementation: string;
  arabicDescription: string;
}

export interface ReligiousConsideration {
  name: string;
  arabicName: string;
  description: string;
  medicalImpact: string;
  accommodations: string[];
  schedulingImpact?: {
    avoidTimes?: string[];
    preferredTimes?: string[];
  };
}

export interface SocialCustom {
  custom: string;
  arabicCustom: string;
  context: "family" | "gender" | "age" | "hierarchy" | "hospitality";
  healthcareApplication: string;
  considerations: string[];
}

export interface CommunicationProtocol {
  scenario: string;
  arabicScenario: string;
  culturalApproach: string;
  languagePreferences: {
    formalArabic: string;
    informalArabic: string;
    english: string;
  };
  nonVerbalConsiderations: string[];
}

export interface PatientCulturalProfile {
  patientId: string;
  culturalBackground:
    | "saudi_native"
    | "gulf_expat"
    | "arab_expat"
    | "non_arab_expat"
    | "bedouin"
    | "urban_saudi";
  religiosity: "very_religious" | "religious" | "moderate" | "secular";
  languagePreference: "arabic_only" | "english_preferred" | "bilingual";
  genderPreferences: {
    doctorGender?: "male" | "female" | "no_preference";
    nurseGender?: "male" | "female" | "no_preference";
  };
  familyInvolvement: "high" | "medium" | "low";
  traditionalMedicineUse: "frequent" | "occasional" | "rare" | "never";
  schedulingPreferences: {
    avoidRamadan?: boolean;
    avoidPrayerTimes?: boolean;
    preferWeekends?: boolean;
  };
}

export class SaudiCulturalContextEngine {
  private readonly CULTURAL_PREFERENCES: CulturalPreference[] = [
    {
      category: "religious",
      preference: "Prayer Time Accommodation",
      description:
        "Respect for five daily prayer times in scheduling and care delivery",
      importance: "critical",
      implementation:
        "Schedule appointments around prayer times, provide prayer area access",
      arabicDescription: "احترام أوقات الصلوات الخمس في الجدولة وتقديم الرعاية",
    },
    {
      category: "religious",
      preference: "Ramadan Considerations",
      description:
        "Adjust medication timing and appointment scheduling during Ramadan",
      importance: "high",
      implementation:
        "Modify medication schedules for fasting, offer evening appointments",
      arabicDescription: "تعديل مواعيد الأدوية والمواعيد خلال شهر رمضان",
    },
    {
      category: "religious",
      preference: "Halal Medication Requirements",
      description:
        "Ensure medications and treatments comply with Islamic dietary laws",
      importance: "high",
      implementation:
        "Check medication ingredients, provide halal alternatives when possible",
      arabicDescription:
        "التأكد من أن الأدوية والعلاجات تتوافق مع القوانين الغذائية الإسلامية",
    },
    {
      category: "social",
      preference: "Gender Segregation",
      description:
        "Respect for gender preferences in healthcare provider selection",
      importance: "high",
      implementation: "Offer same-gender healthcare providers when requested",
      arabicDescription: "احترام تفضيلات الجنس في اختيار مقدم الرعاية الصحية",
    },
    {
      category: "social",
      preference: "Family Involvement",
      description:
        "Include family members in medical decisions and care planning",
      importance: "high",
      implementation:
        "Involve family heads in decision-making, respect hierarchical structure",
      arabicDescription: "إشراك أفراد الأسرة في القرارات الطبية وتخطيط الرعاية",
    },
    {
      category: "medical",
      preference: "Traditional Medicine Integration",
      description:
        "Acknowledge and integrate traditional Arabic medicine practices",
      importance: "medium",
      implementation:
        "Discuss traditional remedies, ensure safety and interaction awareness",
      arabicDescription: "دمج ممارسات الطب العربي التقليدي",
    },
    {
      category: "communication",
      preference: "Formal Communication Style",
      description:
        "Use respectful, formal communication especially with elders",
      importance: "high",
      implementation:
        "Use titles, formal Arabic expressions, show proper respect",
      arabicDescription: "استخدام أسلوب التواصل الرسمي والمحترم",
    },
    {
      category: "scheduling",
      preference: "Weekend Preference",
      description: "Prefer Thursday-Friday weekend for non-urgent appointments",
      importance: "medium",
      implementation:
        "Offer weekend appointment slots, accommodate work schedules",
      arabicDescription: "تفضيل عطلة نهاية الأسبوع للمواعيد غير العاجلة",
    },
  ];

  private readonly RELIGIOUS_CONSIDERATIONS: ReligiousConsideration[] = [
    {
      name: "Five Daily Prayers",
      arabicName: "الصلوات الخمس",
      description: "Muslims perform five daily prayers at specific times",
      medicalImpact: "May affect appointment scheduling and medication timing",
      accommodations: [
        "Schedule appointments between prayer times",
        "Provide prayer area in facility",
        "Allow breaks for prayer during long procedures",
        "Adjust IV fluid timing if needed",
      ],
      schedulingImpact: {
        avoidTimes: [
          "sunrise-30min",
          "midday±30min",
          "afternoon±30min",
          "sunset±30min",
          "night±30min",
        ],
        preferredTimes: ["mid-morning", "early afternoon", "early evening"],
      },
    },
    {
      name: "Ramadan Fasting",
      arabicName: "صيام رمضان",
      description: "Month-long fasting from dawn to sunset",
      medicalImpact:
        "Affects medication timing, procedure scheduling, and nutritional status",
      accommodations: [
        "Adjust medication schedules for pre-dawn and post-sunset",
        "Schedule non-urgent procedures outside Ramadan when possible",
        "Monitor blood sugar levels more closely in diabetic patients",
        "Provide guidance on breaking fast for medical needs",
      ],
    },
    {
      name: "Hajj Pilgrimage",
      arabicName: "الحج",
      description:
        "Annual pilgrimage to Mecca, religious obligation for able Muslims",
      medicalImpact:
        "May affect availability for treatments and follow-up care",
      accommodations: [
        "Schedule major procedures before or after Hajj season",
        "Provide medical clearance for pilgrimage",
        "Ensure medication supply for travel",
        "Coordinate with pilgrimage health services",
      ],
    },
    {
      name: "Wudu (Ablution)",
      arabicName: "الوضوء",
      description: "Ritual washing before prayers",
      medicalImpact: "May affect wound care and IV line management",
      accommodations: [
        "Waterproof dressing options for prayer ablution",
        "Educate on tayammum (dry ablution) when water contact restricted",
        "Provide accessible washing facilities",
      ],
    },
    {
      name: "Halal Requirements",
      arabicName: "متطلبات الحلال",
      description: "Islamic dietary and lifestyle laws",
      medicalImpact:
        "Affects medication ingredients, surgical materials, and dietary recommendations",
      accommodations: [
        "Check medications for pork-derived ingredients",
        "Verify halal status of nutritional supplements",
        "Use halal-certified surgical materials when possible",
        "Provide halal meal options",
      ],
    },
  ];

  private readonly SOCIAL_CUSTOMS: SocialCustom[] = [
    {
      custom: "Respect for Elders",
      arabicCustom: "احترام كبار السن",
      context: "hierarchy",
      healthcareApplication:
        "Elder family members often make medical decisions",
      considerations: [
        "Address elders first in family consultations",
        "Use formal titles and respectful language",
        "Allow extra time for elder consultations",
        "Recognize elder authority in family health decisions",
      ],
    },
    {
      custom: "Gender Interaction Guidelines",
      arabicCustom: "إرشادات التفاعل بين الجنسين",
      context: "gender",
      healthcareApplication:
        "Affects provider-patient interactions and physical examinations",
      considerations: [
        "Offer same-gender providers when requested",
        "Use appropriate draping and privacy measures",
        "Include female family member presence for male providers examining female patients",
        "Respect handshaking preferences",
      ],
    },
    {
      custom: "Hospitality and Generosity",
      arabicCustom: "الضيافة والكرم",
      context: "hospitality",
      healthcareApplication: "Patients may offer gifts or excessive gratitude",
      considerations: [
        "Graciously decline gifts while showing appreciation",
        "Provide warm, welcoming environment",
        "Offer refreshments in waiting areas",
        "Show genuine care and interest",
      ],
    },
    {
      custom: "Family Honor and Privacy",
      arabicCustom: "شرف الأسرة والخصوصية",
      context: "family",
      healthcareApplication:
        "Medical information may be sensitive for family reputation",
      considerations: [
        "Extra discretion with mental health and reproductive health issues",
        "Provide private consultation options",
        "Respect family decision-making hierarchy",
        "Maintain strict confidentiality",
      ],
    },
    {
      custom: "Extended Family Support",
      arabicCustom: "دعم العائلة الممتدة",
      context: "family",
      healthcareApplication: "Large family groups may accompany patients",
      considerations: [
        "Provide adequate seating in consultation rooms",
        "Allow family member presence during procedures when appropriate",
        "Include family in education and discharge planning",
        "Accommodate multiple family member questions",
      ],
    },
  ];

  private readonly COMMUNICATION_PROTOCOLS: CommunicationProtocol[] = [
    {
      scenario: "Initial Patient Consultation",
      arabicScenario: "الاستشارة الأولية للمريض",
      culturalApproach:
        "Begin with religious greeting, show respect for family hierarchy",
      languagePreferences: {
        formalArabic: "السلام عليكم ورحمة الله وبركاته، أهلاً وسهلاً بكم",
        informalArabic: "مرحبا، كيف حالكم؟",
        english: "Peace be upon you, welcome to our clinic",
      },
      nonVerbalConsiderations: [
        "Maintain appropriate eye contact",
        "Use open, welcoming gestures",
        "Respect personal space preferences",
        "Show attentiveness to all family members present",
      ],
    },
    {
      scenario: "Delivering Difficult News",
      arabicScenario: "تقديم أخبار صعبة",
      culturalApproach:
        "Involve family head, use gentle language, reference divine will when appropriate",
      languagePreferences: {
        formalArabic: "نحن نقدر صعوبة هذا الخبر، وندعو الله أن يعينكم",
        informalArabic: "هذا خبر صعب، لكن إن شاء الله كله خير",
        english:
          "This is difficult news, but we will work together through this",
      },
      nonVerbalConsiderations: [
        "Speak slowly and clearly",
        "Allow for emotional responses",
        "Provide tissues and comfort",
        "Give time for family discussion",
      ],
    },
    {
      scenario: "Medication Instructions",
      arabicScenario: "تعليمات الدواء",
      culturalApproach:
        "Provide clear written instructions in Arabic, consider Ramadan timing",
      languagePreferences: {
        formalArabic: "يُرجى تناول هذا الدواء حسب التوجيهات المكتوبة",
        informalArabic: "خذ الدواء زي ما هو مكتوب",
        english: "Please take this medication as written in the instructions",
      },
      nonVerbalConsiderations: [
        "Demonstrate proper medication technique",
        "Use visual aids and written materials",
        "Confirm understanding through teach-back method",
      ],
    },
  ];

  // Assess patient cultural profile
  assessCulturalProfile(patientData: {
    nationality: string;
    languagePreference: string;
    religiousBackground: string;
    familyStructure: string;
    previousMedicalHistory: any;
  }): PatientCulturalProfile {
    let culturalBackground: PatientCulturalProfile["culturalBackground"] =
      "saudi_native";
    let religiosity: PatientCulturalProfile["religiosity"];
    let familyInvolvement: PatientCulturalProfile["familyInvolvement"] = "high";

    // Determine cultural background
    if (patientData.nationality === "Saudi") {
      culturalBackground = "saudi_native";
    } else if (
      ["UAE", "Qatar", "Kuwait", "Bahrain", "Oman"].includes(
        patientData.nationality
      )
    ) {
      culturalBackground = "gulf_expat";
    } else if (
      ["Egypt", "Jordan", "Lebanon", "Syria", "Palestine"].includes(
        patientData.nationality
      )
    ) {
      culturalBackground = "arab_expat";
    } else {
      culturalBackground = "non_arab_expat";
    }

    // Assess religiosity based on background
    if (patientData.religiousBackground === "very_conservative") {
      religiosity = "very_religious";
    } else if (patientData.religiousBackground === "moderate") {
      religiosity = "moderate";
    } else if (patientData.religiousBackground === "secular") {
      religiosity = "secular";
    } else {
      // Default case for 'religious' and any other values
      religiosity = "religious";
    }

    return {
      patientId: `patient_${Date.now()}`,
      culturalBackground,
      religiosity,
      languagePreference: patientData.languagePreference as any,
      genderPreferences: {
        doctorGender:
          religiosity === "very_religious" ? "female" : "no_preference",
        nurseGender:
          religiosity === "very_religious" ? "female" : "no_preference",
      },
      familyInvolvement,
      traditionalMedicineUse:
        culturalBackground === "saudi_native" ? "occasional" : "rare",
      schedulingPreferences: {
        avoidRamadan: religiosity !== "secular",
        avoidPrayerTimes: religiosity !== "secular",
        preferWeekends: true,
      },
    };
  }

  // Get cultural recommendations for patient care
  getCulturalRecommendations(profile: PatientCulturalProfile): {
    priority: string[];
    considerations: string[];
    accommodations: string[];
    communication: string[];
  } {
    const recommendations = {
      priority: [] as string[],
      considerations: [] as string[],
      accommodations: [] as string[],
      communication: [] as string[],
    };

    // High-priority religious considerations
    if (
      profile.religiosity === "very_religious" ||
      profile.religiosity === "religious"
    ) {
      recommendations.priority.push("Schedule around prayer times");
      recommendations.priority.push("Ensure halal medication options");
      recommendations.accommodations.push("Provide prayer area access");
      recommendations.accommodations.push("Offer same-gender providers");
    }

    // Family involvement considerations
    if (profile.familyInvolvement === "high") {
      recommendations.considerations.push(
        "Include family in medical decisions"
      );
      recommendations.considerations.push(
        "Address family hierarchy appropriately"
      );
      recommendations.accommodations.push(
        "Provide adequate seating for family members"
      );
    }

    // Language preferences
    if (profile.languagePreference === "arabic_only") {
      recommendations.communication.push("Provide Arabic-speaking staff");
      recommendations.communication.push("Use formal Arabic expressions");
      recommendations.accommodations.push("Provide Arabic written materials");
    }

    // Cultural background specific
    if (profile.culturalBackground === "bedouin") {
      recommendations.considerations.push(
        "May prefer traditional healing methods"
      );
      recommendations.considerations.push(
        "May have different pain expression patterns"
      );
    }

    // Traditional medicine use
    if (profile.traditionalMedicineUse === "frequent") {
      recommendations.considerations.push(
        "Inquire about current traditional remedies"
      );
      recommendations.considerations.push("Check for herb-drug interactions");
    }

    return recommendations;
  }

  // Validate cultural appropriateness of care plan
  validateCulturalAppropriateness(
    careplan: any,
    profile: PatientCulturalProfile
  ): {
    appropriate: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check medication timing against prayer schedule
    if (
      profile.schedulingPreferences.avoidPrayerTimes &&
      careplan.medications
    ) {
      careplan.medications.forEach((med: any) => {
        if (med.timing && this.conflictsWithPrayerTimes(med.timing)) {
          issues.push(
            `Medication ${med.name} timing conflicts with prayer times`
          );
          suggestions.push(`Adjust ${med.name} to be taken after prayers`);
        }
      });
    }

    // Check for Ramadan considerations
    if (profile.schedulingPreferences.avoidRamadan && careplan.appointments) {
      const ramadanPeriod = this.getCurrentRamadanPeriod();
      careplan.appointments.forEach((apt: any) => {
        if (this.isDuringRamadan(apt.date, ramadanPeriod)) {
          if (apt.type === "elective") {
            suggestions.push(
              `Consider rescheduling elective appointment after Ramadan`
            );
          } else {
            suggestions.push(`Adjust appointment timing for fasting schedule`);
          }
        }
      });
    }

    // Check gender preferences
    if (profile.genderPreferences.doctorGender && careplan.assignedDoctor) {
      if (
        careplan.assignedDoctor.gender !==
        profile.genderPreferences.doctorGender
      ) {
        issues.push("Assigned doctor gender does not match patient preference");
        suggestions.push(
          `Assign ${profile.genderPreferences.doctorGender} doctor if available`
        );
      }
    }

    // Check halal requirements
    if (profile.religiosity !== "secular" && careplan.medications) {
      careplan.medications.forEach((med: any) => {
        if (
          med.ingredients &&
          this.containsNonHalalIngredients(med.ingredients)
        ) {
          issues.push(
            `Medication ${med.name} may contain non-halal ingredients`
          );
          suggestions.push(`Find halal alternative for ${med.name}`);
        }
      });
    }

    return {
      appropriate: issues.length === 0,
      issues,
      suggestions,
    };
  }

  // Get prayer times for scheduling
  getPrayerTimes(
    date: Date,
    location: "riyadh" | "jeddah" | "dammam" = "riyadh"
  ): {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  } {
    // Simplified prayer times - in production, use accurate Islamic calendar calculations
    let baseHour = 0;
    if (location === "jeddah") {
      baseHour = -1;
    } else if (location !== "riyadh") {
      baseHour = 1;
    }

    return {
      fajr: `${5 + baseHour}:30`,
      dhuhr: `${12 + baseHour}:15`,
      asr: `${15 + baseHour}:30`,
      maghrib: `${18 + baseHour}:45`,
      isha: `${20 + baseHour}:15`,
    };
  }

  // Generate culturally appropriate appointment slots
  generateCulturallyAppropriateSlots(
    date: Date,
    profile: PatientCulturalProfile,
    duration: number = 30
  ): string[] {
    const slots: string[] = [];
    // Prayer times would be used for filtering in production
    // const prayerTimes = this.getPrayerTimes(date);

    // Define general available hours
    const startHour = 8;
    const endHour = 20;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Check if slot conflicts with prayer times
        if (profile.schedulingPreferences.avoidPrayerTimes) {
          if (!this.conflictsWithPrayerTimes(timeSlot)) {
            slots.push(timeSlot);
          }
        } else {
          slots.push(timeSlot);
        }
      }
    }

    return slots;
  }

  // Helper methods
  private conflictsWithPrayerTimes(timeSlot: string): boolean {
    // Simplified check - in production, implement proper time comparison
    const conflictTimes = ["05:30", "12:15", "15:30", "18:45", "20:15"];
    return conflictTimes.some((time) => {
      const slotMinutes = this.timeToMinutes(timeSlot);
      const prayerMinutes = this.timeToMinutes(time);
      return Math.abs(slotMinutes - prayerMinutes) < 30; // 30-minute buffer
    });
  }

  private timeToMinutes(time: string): number {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  }

  private getCurrentRamadanPeriod(): { start: Date; end: Date } {
    // Simplified - in production, calculate based on Islamic calendar
    const currentYear = new Date().getFullYear();
    return {
      start: new Date(currentYear, 2, 15), // Approximate
      end: new Date(currentYear, 3, 15), // Approximate
    };
  }

  private isDuringRamadan(
    date: string,
    ramadanPeriod: { start: Date; end: Date }
  ): boolean {
    const appointmentDate = new Date(date);
    return (
      appointmentDate >= ramadanPeriod.start &&
      appointmentDate <= ramadanPeriod.end
    );
  }

  private containsNonHalalIngredients(ingredients: string[]): boolean {
    const nonHalalIngredients = ["pork", "alcohol", "gelatin", "lard"];
    return ingredients.some((ingredient) =>
      nonHalalIngredients.some((nonHalal) =>
        ingredient.toLowerCase().includes(nonHalal)
      )
    );
  }

  // Get all cultural preferences
  getCulturalPreferences(): CulturalPreference[] {
    return this.CULTURAL_PREFERENCES;
  }

  // Get religious considerations
  getReligiousConsiderations(): ReligiousConsideration[] {
    return this.RELIGIOUS_CONSIDERATIONS;
  }

  // Get social customs
  getSocialCustoms(): SocialCustom[] {
    return this.SOCIAL_CUSTOMS;
  }

  // Get communication protocols
  getCommunicationProtocols(): CommunicationProtocol[] {
    return this.COMMUNICATION_PROTOCOLS;
  }
}
