/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a',
        },
        accent: { 50: '#f5f3ff', 100: '#ede9fe', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'Noto Sans', 'sans-serif'],
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: { fadeUp: 'fadeUp .25s ease-out both' },
    },
  },
  plugins: [],
};
