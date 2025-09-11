/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // BrainSAIT Healthcare Color Palette
      colors: {
        // Primary Brand Colors
        'midnight-blue': '#1a365d',
        'medical-blue': '#2b6cb8',
        'signal-teal': '#0ea5e9',
        'deep-orange': '#ea580c',
        'professional-gray': '#64748b',
        
        // Healthcare Semantic Colors
        'success-green': '#10b981',
        'warning-amber': '#f59e0b',
        'error-red': '#ef4444',
        'info-blue': '#3b82f6',
        
        // Glass Morphism Support
        'glass': {
          50: 'rgba(255, 255, 255, 0.05)',
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.3)',
        },
        
        // Arabic/RTL Theme Support
        'arabic': {
          primary: '#1a365d',
          secondary: '#2b6cb8',
          accent: '#0ea5e9',
        },
      },
      
      // Typography for Arabic/English
      fontFamily: {
        'sans': ['Inter', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        'arabic': ['IBM Plex Sans Arabic', 'Noto Sans Arabic', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      // Spacing for healthcare UI
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Animation for smooth interactions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'mesh-gradient': 'meshGradient 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        meshGradient: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '33%': { transform: 'rotate(120deg) scale(1.1)' },
          '66%': { transform: 'rotate(240deg) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      
      // Glass morphism effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Healthcare-specific shadows
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'medical': '0 4px 20px rgba(43, 108, 184, 0.15)',
        'error': '0 4px 20px rgba(239, 68, 68, 0.15)',
        'success': '0 4px 20px rgba(16, 185, 129, 0.15)',
      },
      
      // Border radius for modern UI
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Grid templates for dashboard layouts
      gridTemplateColumns: {
        'dashboard': 'minmax(250px, 1fr) 4fr',
        'cards': 'repeat(auto-fit, minmax(300px, 1fr))',
        'metrics': 'repeat(auto-fit, minmax(200px, 1fr))',
      },
      
      // Z-index scale for layering
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    
    // Custom plugin for RTL support
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
      };
      
      const glassMorphismComponents = {
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'border-radius': '1rem',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-button': {
          'background': 'rgba(255, 255, 255, 0.15)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'background': 'rgba(255, 255, 255, 0.25)',
            'transform': 'translateY(-2px)',
          },
        },
        '.mesh-gradient-bg': {
          'background': 'linear-gradient(45deg, #1a365d, #2b6cb8, #0ea5e9, #ea580c)',
          'background-size': '400% 400%',
          'animation': 'meshGradient 8s ease-in-out infinite',
        },
      };
      
      addUtilities(newUtilities);
      addComponents(glassMorphismComponents);
    },
  ],
};
