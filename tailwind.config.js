/** Tailwind mapped to the Impeccable-style design tokens defined as CSS variables in src/index.css.
 *  Tokens are OKLCH, neutrals are tinted toward the brand hue, type follows a modular scale,
 *  spacing sits on a 4px base, and motion uses ease-out curves only (no bounce/elastic). */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        raised: 'var(--raised)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        'primary-ink': 'var(--primary-ink)',
        'primary-soft': 'var(--primary-soft)',
        gold: 'var(--gold)',
        'gold-soft': 'var(--gold-soft)',
        danger: 'var(--danger)',
        ok: 'var(--ok)',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
      },
      fontSize: {
        // modular scale 1.2 (fluid at the top end)
        xs: ['0.8125rem', { lineHeight: '1.5' }],
        sm: ['0.9375rem', { lineHeight: '1.6' }],
        base: ['1.0625rem', { lineHeight: '1.7' }],
        lg: ['1.25rem', { lineHeight: '1.5' }],
        xl: ['1.5rem', { lineHeight: '1.35' }],
        '2xl': ['clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem)', { lineHeight: '1.25' }],
        '3xl': ['clamp(2.1rem, 1.5rem + 2.8vw, 3.4rem)', { lineHeight: '1.15' }],
      },
      borderRadius: { DEFAULT: '10px', lg: '14px', xl: '20px' },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      maxWidth: { page: '72rem', prose: '42rem' },
    },
  },
  plugins: [],
};
