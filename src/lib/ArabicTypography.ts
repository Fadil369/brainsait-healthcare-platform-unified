/**
 * Arabic Typography System with IBM Plex Sans Arabic
 * Comprehensive typography solution for Saudi healthcare platform
 * Optimized for medical content readability and cultural appropriateness
 */

export interface TypographyTheme {
  fontFamily: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface ArabicTypographyConfig {
  locale: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  fontSizeScale: number;
  lineHeightScale: number;
  wordSpacing: string;
  textAlign: 'right' | 'left' | 'center' | 'justify';
}

export interface MedicalDocumentStyle {
  documentType: 'prescription' | 'report' | 'diagnosis' | 'instructions' | 'consent';
  arabicStyle: {
    fontSize: string;
    lineHeight: number;
    fontWeight: number;
    textAlign: 'right' | 'center';
    wordSpacing: string;
    letterSpacing: string;
  };
  englishStyle: {
    fontSize: string;
    lineHeight: number;
    fontWeight: number;
    textAlign: 'left' | 'center';
    wordSpacing: string;
    letterSpacing: string;
  };
}

export class ArabicTypographyEngine {
  private readonly IBM_PLEX_ARABIC_WEIGHTS = [300, 400, 500, 600, 700];
  private readonly GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2';
  
  private readonly ARABIC_TYPOGRAPHY_THEME: TypographyTheme = {
    fontFamily: {
      primary: "'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Segoe UI Arabic', sans-serif",
      secondary: "'Noto Sans Arabic', 'Segoe UI Arabic', 'Tahoma', sans-serif",
      monospace: "'IBM Plex Mono', 'Courier New', monospace"
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.05em'
    }
  };

  private readonly ENGLISH_TYPOGRAPHY_THEME: TypographyTheme = {
    fontFamily: {
      primary: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
      secondary: "'Arial', 'Helvetica', sans-serif",
      monospace: "'IBM Plex Mono', 'Courier New', monospace"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em'
    }
  };

  private readonly MEDICAL_DOCUMENT_STYLES: Record<string, MedicalDocumentStyle> = {
    prescription: {
      documentType: 'prescription',
      arabicStyle: {
        fontSize: '1.125rem',
        lineHeight: 1.6,
        fontWeight: 500,
        textAlign: 'right',
        wordSpacing: '0.1em',
        letterSpacing: '0.025em'
      },
      englishStyle: {
        fontSize: '1rem',
        lineHeight: 1.5,
        fontWeight: 500,
        textAlign: 'left',
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }
    },
    report: {
      documentType: 'report',
      arabicStyle: {
        fontSize: '1rem',
        lineHeight: 1.7,
        fontWeight: 400,
        textAlign: 'right',
        wordSpacing: '0.05em',
        letterSpacing: '0.01em'
      },
      englishStyle: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontWeight: 400,
        textAlign: 'left',
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }
    },
    diagnosis: {
      documentType: 'diagnosis',
      arabicStyle: {
        fontSize: '1.25rem',
        lineHeight: 1.5,
        fontWeight: 600,
        textAlign: 'right',
        wordSpacing: '0.08em',
        letterSpacing: '0.02em'
      },
      englishStyle: {
        fontSize: '1.125rem',
        lineHeight: 1.4,
        fontWeight: 600,
        textAlign: 'left',
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }
    },
    instructions: {
      documentType: 'instructions',
      arabicStyle: {
        fontSize: '1.125rem',
        lineHeight: 1.8,
        fontWeight: 500,
        textAlign: 'right',
        wordSpacing: '0.12em',
        letterSpacing: '0.03em'
      },
      englishStyle: {
        fontSize: '1rem',
        lineHeight: 1.7,
        fontWeight: 500,
        textAlign: 'left',
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }
    },
    consent: {
      documentType: 'consent',
      arabicStyle: {
        fontSize: '0.875rem',
        lineHeight: 1.8,
        fontWeight: 400,
        textAlign: 'right',
        wordSpacing: '0.06em',
        letterSpacing: '0.015em'
      },
      englishStyle: {
        fontSize: '0.875rem',
        lineHeight: 1.7,
        fontWeight: 400,
        textAlign: 'left',
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }
    }
  };

  // Load IBM Plex Sans Arabic fonts
  async loadIBMPlexArabicFonts(): Promise<void> {
    const weights = this.IBM_PLEX_ARABIC_WEIGHTS.join(';');
    const fontUrl = `${this.GOOGLE_FONTS_URL}?family=IBM+Plex+Sans+Arabic:wght@${weights}&display=swap`;
    
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('Failed to load IBM Plex Sans Arabic'));
      document.head.appendChild(link);
    });
  }

  // Load fallback Arabic fonts
  async loadFallbackArabicFonts(): Promise<void> {
    const fallbackFonts = [
      'Noto+Sans+Arabic:wght@300;400;500;600;700',
      'Amiri:wght@400;700',
      'Cairo:wght@300;400;600;700'
    ];

    const promises = fallbackFonts.map(font => {
      return new Promise<void>((resolve, reject) => {
        const link = document.createElement('link');
        link.href = `${this.GOOGLE_FONTS_URL}?family=${font}&display=swap`;
        link.rel = 'stylesheet';
        link.onload = () => resolve();
        link.onerror = () => resolve(); // Don't fail if fallback fonts fail
        document.head.appendChild(link);
      });
    });

    await Promise.all(promises);
  }

  // Get typography theme based on locale
  getTypographyTheme(locale: 'ar' | 'en'): TypographyTheme {
    return locale === 'ar' ? this.ARABIC_TYPOGRAPHY_THEME : this.ENGLISH_TYPOGRAPHY_THEME;
  }

  // Generate CSS variables for typography
  generateTypographyCSSVariables(locale: 'ar' | 'en'): string {
    const theme = this.getTypographyTheme(locale);
    
    const cssVariables = `
      :root {
        /* Font Families */
        --font-primary: ${theme.fontFamily.primary};
        --font-secondary: ${theme.fontFamily.secondary};
        --font-monospace: ${theme.fontFamily.monospace};
        
        /* Font Sizes */
        --text-xs: ${theme.fontSize.xs};
        --text-sm: ${theme.fontSize.sm};
        --text-base: ${theme.fontSize.base};
        --text-lg: ${theme.fontSize.lg};
        --text-xl: ${theme.fontSize.xl};
        --text-2xl: ${theme.fontSize['2xl']};
        --text-3xl: ${theme.fontSize['3xl']};
        --text-4xl: ${theme.fontSize['4xl']};
        --text-5xl: ${theme.fontSize['5xl']};
        
        /* Font Weights */
        --font-light: ${theme.fontWeight.light};
        --font-normal: ${theme.fontWeight.normal};
        --font-medium: ${theme.fontWeight.medium};
        --font-semibold: ${theme.fontWeight.semibold};
        --font-bold: ${theme.fontWeight.bold};
        
        /* Line Heights */
        --leading-tight: ${theme.lineHeight.tight};
        --leading-normal: ${theme.lineHeight.normal};
        --leading-relaxed: ${theme.lineHeight.relaxed};
        --leading-loose: ${theme.lineHeight.loose};
        
        /* Letter Spacing */
        --tracking-tight: ${theme.letterSpacing.tight};
        --tracking-normal: ${theme.letterSpacing.normal};
        --tracking-wide: ${theme.letterSpacing.wide};
        
        /* Direction and Text Alignment */
        --text-direction: ${locale === 'ar' ? 'rtl' : 'ltr'};
        --text-align: ${locale === 'ar' ? 'right' : 'left'};
      }
    `;
    
    return cssVariables;
  }

  // Generate medical document CSS
  generateMedicalDocumentCSS(documentType: string, locale: 'ar' | 'en'): string {
    const style = this.MEDICAL_DOCUMENT_STYLES[documentType];
    if (!style) {
      throw new Error(`Unknown document type: ${documentType}`);
    }

    const docStyle = locale === 'ar' ? style.arabicStyle : style.englishStyle;
    
    return `
      .medical-document-${documentType} {
        font-family: var(--font-primary);
        font-size: ${docStyle.fontSize};
        line-height: ${docStyle.lineHeight};
        font-weight: ${docStyle.fontWeight};
        text-align: ${docStyle.textAlign};
        word-spacing: ${docStyle.wordSpacing};
        letter-spacing: ${docStyle.letterSpacing};
        direction: ${locale === 'ar' ? 'rtl' : 'ltr'};
      }
    `;
  }

  // Create responsive typography configuration
  createResponsiveTypography(locale: 'ar' | 'en'): string {
    const baseMultiplier = locale === 'ar' ? 1.1 : 1.0; // Arabic text typically needs slightly larger size
    
    return `
      /* Base Typography */
      .typography-responsive {
        font-family: var(--font-primary);
        direction: var(--text-direction);
        text-align: var(--text-align);
      }
      
      /* Responsive Font Sizes */
      @media (max-width: 640px) {
        .typography-responsive {
          font-size: calc(var(--text-base) * ${0.9 * baseMultiplier});
          line-height: var(--leading-relaxed);
        }
        .typography-responsive h1 {
          font-size: calc(var(--text-2xl) * ${0.9 * baseMultiplier});
        }
        .typography-responsive h2 {
          font-size: calc(var(--text-xl) * ${0.9 * baseMultiplier});
        }
        .typography-responsive h3 {
          font-size: calc(var(--text-lg) * ${0.9 * baseMultiplier});
        }
      }
      
      @media (min-width: 641px) and (max-width: 1024px) {
        .typography-responsive {
          font-size: calc(var(--text-base) * ${baseMultiplier});
          line-height: var(--leading-normal);
        }
        .typography-responsive h1 {
          font-size: calc(var(--text-3xl) * ${baseMultiplier});
        }
        .typography-responsive h2 {
          font-size: calc(var(--text-2xl) * ${baseMultiplier});
        }
        .typography-responsive h3 {
          font-size: calc(var(--text-xl) * ${baseMultiplier});
        }
      }
      
      @media (min-width: 1025px) {
        .typography-responsive {
          font-size: calc(var(--text-lg) * ${baseMultiplier});
          line-height: var(--leading-normal);
        }
        .typography-responsive h1 {
          font-size: calc(var(--text-4xl) * ${baseMultiplier});
        }
        .typography-responsive h2 {
          font-size: calc(var(--text-3xl) * ${baseMultiplier});
        }
        .typography-responsive h3 {
          font-size: calc(var(--text-2xl) * ${baseMultiplier});
        }
      }
    `;
  }

  // Arabic-specific text optimization
  optimizeArabicText(text: string): {
    optimized: string;
    improvements: string[];
  } {
    const improvements: string[] = [];
    let optimized = text;

    // Add proper Arabic spacing
    optimized = optimized.replace(/([أ-ي])\s+([أ-ي])/g, '$1 $2');
    improvements.push('Adjusted Arabic word spacing');

    // Ensure proper punctuation spacing
    optimized = optimized.replace(/([أ-ي])([.!?،؛:])/g, '$1 $2');
    improvements.push('Added proper punctuation spacing');

    // Handle Arabic numerals vs Western numerals
    if (/[0-9]/.test(optimized)) {
      // Convert to Arabic-Indic numerals for better readability
      const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      optimized = optimized.replace(/[0-9]/g, (match) => arabicNumerals[parseInt(match)]);
      improvements.push('Converted to Arabic-Indic numerals');
    }

    return { optimized, improvements };
  }

  // Calculate optimal line length for Arabic text
  calculateOptimalLineLength(
    fontSize: number,
    containerWidth: number,
    locale: 'ar' | 'en'
  ): {
    charactersPerLine: number;
    wordsPerLine: number;
    recommendation: string;
  } {
    // Arabic text generally requires different character-per-line calculations
    const baseCharacterWidth = locale === 'ar' ? fontSize * 0.6 : fontSize * 0.5;
    const optimalCharactersPerLine = Math.floor(containerWidth / baseCharacterWidth);
    
    // Arabic words are typically longer than English words
    const avgWordLength = locale === 'ar' ? 6.5 : 5.0;
    const wordsPerLine = Math.floor(optimalCharactersPerLine / avgWordLength);
    
    let recommendation = '';
    if (optimalCharactersPerLine < 35) {
      recommendation = 'Container too narrow for optimal readability';
    } else if (optimalCharactersPerLine > 75) {
      recommendation = 'Consider reducing line length for better readability';
    } else {
      recommendation = 'Optimal line length for medical content';
    }

    return {
      charactersPerLine: optimalCharactersPerLine,
      wordsPerLine,
      recommendation
    };
  }

  // Generate print-optimized styles for medical documents
  generatePrintStyles(locale: 'ar' | 'en'): string {
    return `
      @media print {
        .medical-document {
          font-family: ${locale === 'ar' ? "'IBM Plex Sans Arabic'" : "'Times New Roman'"};
          font-size: ${locale === 'ar' ? '12pt' : '11pt'};
          line-height: ${locale === 'ar' ? '1.6' : '1.5'};
          color: #000000;
          background: #ffffff;
          direction: ${locale === 'ar' ? 'rtl' : 'ltr'};
          text-align: ${locale === 'ar' ? 'right' : 'left'};
        }
        
        .medical-document h1 {
          font-size: ${locale === 'ar' ? '18pt' : '16pt'};
          font-weight: bold;
          page-break-after: avoid;
        }
        
        .medical-document h2 {
          font-size: ${locale === 'ar' ? '16pt' : '14pt'};
          font-weight: bold;
          page-break-after: avoid;
        }
        
        .medical-document p {
          margin-bottom: 12pt;
          orphans: 3;
          widows: 3;
        }
        
        .medical-document .page-break {
          page-break-before: always;
        }
        
        .medical-document .no-print {
          display: none;
        }
        
        /* Arabic-specific print adjustments */
        ${locale === 'ar' ? `
        .medical-document {
          word-spacing: 0.1em;
          letter-spacing: 0.02em;
        }
        ` : ''}
      }
    `;
  }

  // Accessibility-focused typography
  generateAccessibilityStyles(locale: 'ar' | 'en'): string {
    return `
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .typography-accessible {
          font-weight: ${locale === 'ar' ? '500' : '600'};
          letter-spacing: ${locale === 'ar' ? '0.03em' : '0.02em'};
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .typography-accessible * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Large text support */
      .typography-large {
        font-size: calc(var(--text-base) * 1.25);
        line-height: var(--leading-loose);
        letter-spacing: ${locale === 'ar' ? '0.04em' : '0.03em'};
      }
      
      /* Focus indicators */
      .typography-accessible :focus {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
        border-radius: 2px;
      }
      
      /* Screen reader optimizations */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
  }

  // Generate complete typography system
  async generateCompleteTypographySystem(locale: 'ar' | 'en'): Promise<string> {
    // Load fonts first
    await this.loadIBMPlexArabicFonts();
    await this.loadFallbackArabicFonts();

    const cssVariables = this.generateTypographyCSSVariables(locale);
    const responsiveTypography = this.createResponsiveTypography(locale);
    const printStyles = this.generatePrintStyles(locale);
    const accessibilityStyles = this.generateAccessibilityStyles(locale);
    
    // Generate all medical document styles
    const medicalDocumentStyles = Object.keys(this.MEDICAL_DOCUMENT_STYLES)
      .map(docType => this.generateMedicalDocumentCSS(docType, locale))
      .join('\n');

    return `
      ${cssVariables}
      ${responsiveTypography}
      ${medicalDocumentStyles}
      ${printStyles}
      ${accessibilityStyles}
    `;
  }

  // Font loading status check
  async checkFontLoadingStatus(): Promise<{
    ibmPlexArabic: boolean;
    fallbackFonts: string[];
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    let ibmPlexArabic = false;
    const fallbackFonts: string[] = [];

    try {
      // Check if fonts are loaded using CSS Font Loading API
      if ('fonts' in document) {
        const fonts = await document.fonts.ready;
        
        // Check IBM Plex Sans Arabic
        const ibmPlex = new FontFace('IBM Plex Sans Arabic', 'url()');
        try {
          await ibmPlex.load();
          ibmPlexArabic = true;
        } catch {
          recommendations.push('IBM Plex Sans Arabic failed to load, using fallback fonts');
        }

        // Check fallback fonts
        const fallbackFontNames = ['Noto Sans Arabic', 'Amiri', 'Cairo'];
        for (const fontName of fallbackFontNames) {
          try {
            const fallbackFont = new FontFace(fontName, 'url()');
            await fallbackFont.load();
            fallbackFonts.push(fontName);
          } catch {
            // Font not available
          }
        }
      }
    } catch (error) {
      recommendations.push('Font loading API not supported, using system fonts');
    }

    if (!ibmPlexArabic && fallbackFonts.length === 0) {
      recommendations.push('No Arabic fonts loaded successfully, using system defaults');
    }

    return {
      ibmPlexArabic,
      fallbackFonts,
      recommendations
    };
  }
}