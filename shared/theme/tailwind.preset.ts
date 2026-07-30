import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          elevated: 'var(--surface-elevated)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
          accent: 'var(--border-accent)',
        },
        technical: 'var(--technical)',
        'technical-dark': 'var(--technical-dark)',
        'technical-light': 'var(--technical-light)',
        interactive: {
          primary: 'var(--interactive-primary)',
          'primary-hover': 'var(--interactive-primary-hover)',
          accent: 'var(--interactive-accent)',
          'accent-hover': 'var(--interactive-accent-hover)',
          focus: 'var(--interactive-focus)',
        },
        status: {
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          error: 'var(--status-error)',
          'error-bg': 'var(--status-error-bg)',
          info: 'var(--status-info)',
          'info-bg': 'var(--status-info-bg)',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        display: ['40px', { lineHeight: '1.1', fontWeight: '700' }],
        h1: ['32px', { lineHeight: '1.15', fontWeight: '700' }],
        h2: ['26px', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.25', fontWeight: '600' }],
        h4: ['17px', { lineHeight: '1.3', fontWeight: '600' }],
        h5: ['15px', { lineHeight: '1.35', fontWeight: '600' }],
        h6: ['13.5px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.55', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        tiny: ['11px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '20px',
        6: '24px', 8: '32px', 10: '40px', 12: '48px',
        14: '56px', 16: '64px', 20: '80px',
      },
      borderRadius: {
        sm: '4px', md: '8px', lg: '12px',
      },
      boxShadow: {
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
        'elevation-4': 'var(--elevation-4)',
        'elevation-5': 'var(--elevation-5)',
      },
      transitionDuration: {
        fast: '120ms', base: '200ms', slow: '280ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        base: '0', sticky: '10', dropdown: '20',
        sidebar: '30', 'modal-bg': '40', modal: '50', toast: '60',
      },
    },
  },
  plugins: [],
} satisfies Config;
