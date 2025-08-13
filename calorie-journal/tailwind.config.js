// File: tailwind.config.js
// Purpose: Tailwind CSS configuration for NativeWind in the Expo project.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
      },
    },
  },
  plugins: [],
};