/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#F8F7F4',
        'bg-surface': '#FFFFFF',
        'bg-subtle': '#F0EEE9',
        'border': '#E5E3DF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#6B7280',
        'accent': '#2563EB',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'btn': '6px',
      },
    },
  },
  plugins: [],
}
