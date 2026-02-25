/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1b588c',
          dark: '#144670',
          light: '#2470b0',
          50: '#eef5fb',
          100: '#d0e4f3',
          200: '#a1c9e7',
          300: '#72aeda',
          400: '#4393cd',
          500: '#1b588c',
          600: '#144670',
          700: '#0e3454',
          800: '#082238',
          900: '#04111c',
        },
        accent: '#3a9bd5',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        spartan: ['"League Spartan"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(27, 88, 140, 0.10)',
        'card-hover': '0 8px 32px rgba(27, 88, 140, 0.18)',
      },
    },
  },
  plugins: [],
}
