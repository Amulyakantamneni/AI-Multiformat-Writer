// Frontend/postcss.config.js

/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // <-- Tailwind v4 PostCSS plugin
    autoprefixer: {},            // optional but recommended
  },
};
