/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './NowWidget.tsx',
    './components/**/*.{js,jsx,ts,tsx}',
    './now-widget/**/*.{js,jsx,ts,tsx,css}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Add widget-specific customizations here
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    // Include only necessary plugins to keep the CSS footprint small
  ],
};