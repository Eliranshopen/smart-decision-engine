/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07070f',
          900: '#0d0d1a',
          800: '#131326',
          700: '#1a1a33',
          600: '#252540',
        },
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        signal: {
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'dot-grid': "radial-gradient(circle, #ffffff08 1px, transparent 1px)",
        'amber-glow': 'radial-gradient(ellipse at center, #f59e0b22 0%, transparent 70%)',
      },
      backgroundSize: {
        'dot-md': '28px 28px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
