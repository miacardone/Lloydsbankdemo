/**
 * Tailwind is wired to CSS custom properties rather than literal hex values.
 * Every colour below resolves at runtime from the active brand (see
 * src/brand/applyBrand.js), which is what makes the portal white-labelable
 * without a rebuild.
 */
const withOpacity = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: withOpacity('--cf-brand'),
          dark: withOpacity('--cf-brand-dark'),
          medium: withOpacity('--cf-brand-medium'),
          light: withOpacity('--cf-brand-light'),
          lightest: withOpacity('--cf-brand-lightest'),
          contrast: withOpacity('--cf-brand-contrast'),
        },
        accent: {
          DEFAULT: withOpacity('--cf-accent'),
          soft: withOpacity('--cf-accent-soft'),
        },
        ink: {
          DEFAULT: withOpacity('--cf-ink'),
          muted: withOpacity('--cf-ink-muted'),
          subtle: withOpacity('--cf-ink-subtle'),
          inverse: withOpacity('--cf-ink-inverse'),
        },
        surface: {
          DEFAULT: withOpacity('--cf-surface'),
          sunken: withOpacity('--cf-surface-sunken'),
          raised: withOpacity('--cf-surface-raised'),
          nav: withOpacity('--cf-surface-nav'),
          navActive: withOpacity('--cf-surface-nav-active'),
        },
        line: {
          DEFAULT: withOpacity('--cf-line'),
          strong: withOpacity('--cf-line-strong'),
        },
        positive: withOpacity('--cf-positive'),
        negative: withOpacity('--cf-negative'),
        caution: withOpacity('--cf-caution'),
        info: withOpacity('--cf-info'),
      },
      fontFamily: {
        sans: ['var(--cf-font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--cf-font-display)', 'system-ui', 'sans-serif'],
      },
      /* The portal type ramp. Size/leading are paired so rows align across tables. */
      fontSize: {
        'cf-nav-link': ['0.75rem', { lineHeight: '0.875rem', fontWeight: '600' }],
        'cf-nav-header': [
          '0.8125rem',
          { lineHeight: '1.0625rem', letterSpacing: '0.03em', fontWeight: '800' },
        ],
        'cf-label': [
          '0.6875rem',
          { lineHeight: '0.9375rem', letterSpacing: '0.01em', fontWeight: '700' },
        ],
        'cf-body': ['0.875rem', { lineHeight: '1.1875rem' }],
        'cf-button': [
          '1rem',
          { lineHeight: '1.25rem', letterSpacing: '0.03em', fontWeight: '600' },
        ],
        'cf-body-lg': ['1.125rem', { lineHeight: '1.3125rem' }],
        'cf-section': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '700' }],
        'cf-header-md': ['1.875rem', { lineHeight: '2.1875rem' }],
        'cf-header-lg': ['2.75rem', { lineHeight: '3rem', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        cf: 'var(--cf-radius)',
        'cf-lg': 'calc(var(--cf-radius) * 2)',
      },
      boxShadow: {
        cf: '0 1px 2px rgb(3 7 46 / 0.06), 0 1px 3px rgb(3 7 46 / 0.04)',
        'cf-raised': '0 4px 12px rgb(3 7 46 / 0.08), 0 1px 3px rgb(3 7 46 / 0.06)',
        'cf-pop': '0 12px 32px rgb(3 7 46 / 0.20)',
      },
      keyframes: {
        'cf-fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'cf-flow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'cf-fade-up': 'cf-fade-up 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'cf-flow': 'cf-flow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
