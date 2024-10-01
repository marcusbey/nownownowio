 const purgecss = require('@fullhuman/postcss-purgecss')({
     content: ['./src/**/*.tsx', './public/index.html'],
     defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
     safelist: ['now-widget-*'],
   });

   module.exports = {
     plugins: [
       require('postcss-import'),
       require('tailwindcss'),
       ...(process.env.NODE_ENV === 'production' ? [purgecss, require('cssnano')] : []),
       require('autoprefixer'),
     ],
   };