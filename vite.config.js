import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: {
          core: ['./src/js/core/engine.js', './src/js/core/simulation.js'],
          ui: ['./src/js/core/ui.js', './src/js/core/accessibility.js'],
          utils: ['./src/js/utils/storage.js', './src/js/utils/analytics.js', './src/js/utils/helpers.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  preview: {
    port: 4173,
    host: 'localhost',
    open: true
  },
  css: {
    devSourcemap: true
  },
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp']
});
