/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          low: '#86efac',
          medium: '#60a5fa',
          high: '#f59e0b',
          urgent: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
