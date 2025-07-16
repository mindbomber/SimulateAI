/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        main: 'app.html',
      },
      output: {
        manualChunks: {
          core: ['./src/js/core/engine.js', './src/js/core/simulation.js'],
          ui: ['./src/js/core/ui.js', './src/js/core/accessibility.js'],
          utils: [
            './src/js/utils/storage.js',
            './src/js/utils/analytics.js',
            './src/js/utils/helpers.js',
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: 'localhost',
    open: true,
  },
  preview: {
    port: 4173,
    host: 'localhost',
    open: true,
  },
  css: {
    devSourcemap: true,
  },
  assetsInclude: [
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.webp',
  ],
});
