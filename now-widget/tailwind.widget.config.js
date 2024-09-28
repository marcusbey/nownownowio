/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './NowWidget.tsx',
    './*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './now-widget/**/*.{js,jsx,ts,tsx,css}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Add widget-specific customizations here
    },
  },
};