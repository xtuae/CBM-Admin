/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System Colors
        'primary': '#6E5CFF', // Indigo accent
        'primary-600': '#5a47f0',
        'bg-dark-900': '#0b0f1a', // Page background
        'bg-900': '#0f1630', // Sections
        'glass': 'rgba(255,255,255,0.03)',
        'muted': '#98A0B3',
        'danger': '#FF3B30', // Error/danger color
        'danger-hover': '#D63027',
        // Extended grays for comprehensive coverage
        'gray': {
          50: '#F9F9F9',
          100: '#F2F2F2',
          200: '#E5E5E7',
          300: '#D1D1D6',
          400: '#AEAEB2',
          500: '#86868B',
          600: '#636366',
          700: '#48484A',
          800: '#1C1C1E',
          900: '#000000',
        },
      },
      fontFamily: {
        // Modern system font stack
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'HelveticaNeue-Thin', '"Helvetica Neue"', 'sans-serif'],
      },
      spacing: {
        // Spacing scale (4px base)
        'xs': '0.25rem',  // 4px
        'sm': '0.5rem',   // 8px
        'md': '0.75rem',  // 12px
        'lg': '1rem',     // 16px
        'xl': '1.25rem',  // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '2rem',    // 32px
        '4xl': '2.5rem',  // 40px
        '5xl': '3rem',    // 48px
        '6xl': '4rem',    // 64px
        'container': '1200px',
      },
      borderRadius: {
        // Consistent border radius
        'sm': '0.375rem', // 6px for small elements
        'md': '0.5rem',   // 8px for inputs/buttons
        'lg': '1rem',     // 16px for cards
        'xl': '1.5rem',   // 24px for larger elements
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      fontSize: {
        // Typography scale
        'xs': ['0.75rem', { lineHeight: '1.5' }],     // 12px - Small helper text
        'sm': ['0.875rem', { lineHeight: '1.5' }],    // 14px - Body small
        'base': ['1rem', { lineHeight: '1.6' }],      // 16px - Body
        'lg': ['1.125rem', { lineHeight: '1.6' }],    // 18px - Body large
        'xl': ['1.25rem', { lineHeight: '1.5' }],     // 20px - H6
        '2xl': ['1.5rem', { lineHeight: '1.4' }],     // 24px - H5
        '3xl': ['1.875rem', { lineHeight: '1.3' }],   // 30px - H4
        '4xl': ['2.25rem', { lineHeight: '1.2' }],    // 36px - H3
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],     // 48px - H2
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],    // 60px - H1
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
    },
  },
  plugins: [],
}
