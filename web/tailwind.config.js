/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:      '#2a2240',
        ink2:     '#5a5478',
        line:     '#e8e2f3',
        accent:   '#ff6b3d',
        good:     '#3fc775',
        warn:     '#ff5470',
      },
      boxShadow: {
        glow: '0 0 0 4px rgba(160,115,216,0.18)',
        card: '0 8px 28px -10px rgba(60,30,120,0.25)',
        soft: '0 2px 12px rgba(60,30,120,0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.02)' },
        },
        spinSlow: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        breathe:  'breathe 6s ease-in-out infinite',
        spinSlow: 'spinSlow 60s linear infinite',
        floaty:   'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
