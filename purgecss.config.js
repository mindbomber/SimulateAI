module.exports = {
  content: [
    './*.html',
    './src/js/**/*.js'
  ],
  css: ['./src/css/main.css'],
  output: './purged-css/',
  safelist: [
    'scrolled',
    'header-hidden',
    'header-visible',
    'mobile-menu-open',
    'dropdown-open',
    'mega-menu-open',
    // Dynamic classes that might not appear in HTML
    /^auth-/,
    /^user-/,
    /^dropdown-/,
    /^mega-menu-/
  ],
  rejected: true,
  rejectedCss: true
};
