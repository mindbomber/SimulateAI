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

import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig(({ mode }) => {
  // For custom domain (simulateai.io), always use root path
  const base = "/";
  const isProd = (mode || import.meta?.env?.MODE) === "production";

  return {
    root: ".",
    base, // Use "/" for dev, "/SimulateAI/" for production
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false, // Disable sourcemaps for production
      target: "es2020",
      rollupOptions: {
        input: (() => {
          const pages = {
            main: "app.html",
            index: "index.html",
            about: "about.html",
            blog: "blog.html",
            dataDelete: "data-deletion.html",
            donate: "donate.html",
            educator: "educator-tools.html",
            ethics: "ethics-guide.html",
            help: "help-faq.html",
            moderation: "moderation.html",
            privacy: "privacy-notice.html",
            profile: "profile.html",
            research: "research-consent.html",
            terms: "terms-of-use.html",
            // Intentionally omit scenarios.html and any *-test.html from production builds
            // Include welcome.html only in non-production builds
          };
          if (!isProd) {
            pages.welcome = "welcome.html";
          }
          // Always include service worker and legacy earlyThemeInit mapping
          pages.sw = "sw.js";
          pages.earlyThemeInit = "src/js/utils/early-theme-init.js";
          return pages;
        })(),
        // Ensure all JS modules are included in build
        plugins: [
          // Custom plugin to copy config files
          {
            name: "copy-config-files",
            generateBundle() {
              // Config files will be handled by copyPublicDir
            },
          },
          // Copy additional required files
          {
            name: "copy-additional-files",
            generateBundle() {
              // Copy firebase-emergency-fix.js to root of dist (non-production only)
              if (!isProd) {
                try {
                  const firebaseFixContent = fs.readFileSync(
                    "firebase-emergency-fix.js",
                    "utf8",
                  );
                  this.emitFile({
                    type: "asset",
                    fileName: "firebase-emergency-fix.js",
                    source: firebaseFixContent,
                  });
                } catch (e) {
                  console.warn(
                    "Could not copy firebase-emergency-fix.js:",
                    e.message,
                  );
                }
              }

              // Copy media.css to src/styles/
              try {
                const mediaCssContent = fs.readFileSync(
                  "src/styles/media.css",
                  "utf8",
                );
                this.emitFile({
                  type: "asset",
                  fileName: "src/styles/media.css",
                  source: mediaCssContent,
                });
              } catch (e) {
                console.warn("Could not copy media.css:", e.message);
              }

              // Copy default-avatar.svg to src/assets/avatars/
              try {
                const defaultAvatarContent = fs.readFileSync(
                  "src/assets/avatars/default-avatar.svg",
                  "utf8",
                );
                this.emitFile({
                  type: "asset",
                  fileName: "src/assets/avatars/default-avatar.svg",
                  source: defaultAvatarContent,
                });
              } catch (e) {
                console.warn("Could not copy default-avatar.svg:", e.message);
              }

              // Copy shared-navigation.html to src/components/
              try {
                const sharedNavContent = fs.readFileSync(
                  "src/components/shared-navigation.html",
                  "utf8",
                );
                this.emitFile({
                  type: "asset",
                  fileName: "src/components/shared-navigation.html",
                  source: sharedNavContent,
                });
              } catch (e) {
                console.warn(
                  "Could not copy shared-navigation.html:",
                  e.message,
                );
              }
            },
          },
        ],
        external: [], // Don't externalize any modules - bundle everything
        output: {
          format: "es",
          // Don't hash the service worker filename
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith("sw.js")) {
              return "[name].[ext]";
            }
            return "assets/[name]-[hash].[ext]";
          },
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === "sw") {
              return "sw.js";
            }
            if (chunkInfo.name === "earlyThemeInit") {
              return "src/js/utils/early-theme-init.js";
            }
            return "assets/[name]-[hash].js";
          },
          chunkFileNames: "assets/[name]-[hash].js",
          // Global variables for production
          globals: {
            "firebase/app": "firebase",
            "firebase/auth": "firebase",
            "firebase/firestore": "firebase",
            "firebase/analytics": "firebase",
          },
          manualChunks: {
            firebase: [
              "firebase/app",
              "firebase/auth",
              "firebase/firestore",
              "firebase/analytics",
              "firebase/performance",
              "firebase/app-check",
              "firebase/messaging",
              "firebase/storage",
              "firebase/functions",
            ],
            core: ["./src/js/core/engine.js", "./src/js/core/simulation.js"],
            ui: ["./src/js/core/ui.js", "./src/js/core/accessibility.js"],
            utils: [
              "./src/js/utils/storage.js",
              "./src/js/utils/analytics.js",
              "./src/js/utils/helpers.js",
            ],
          },
        },
      },
    },
    server: {
      port: 3000,
      host: "localhost",
      open: true,
    },
    preview: {
      port: 4173,
      host: "localhost",
      open: true,
    },
    css: {
      devSourcemap: true,
      sourcemap: true, // Enable CSS source maps in production
    },
    assetsInclude: [
      "**/*.svg",
      "**/*.png",
      "**/*.jpg",
      "**/*.jpeg",
      "**/*.gif",
      "**/*.webp",
      "**/*.json",
    ],
    publicDir: "public",
    copyPublicDir: true,
  };
});
