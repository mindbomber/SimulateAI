#!/usr/bin/env node
/* eslint-env node */
// Generate ICO and PNG favicons from the canonical SVG artwork
// Outputs:
// - public/favicon.ico (multi-size ICO)
// - src/assets/icons/favicon.png (32x32 PNG fallback)
// - src/assets/icons/apple-touch-icon.png (180x180 PNG for iOS)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const SRC_SVG = path.join(ROOT, "src", "assets", "icons", "favicon.svg");
const OUT_PNG_32 = path.join(ROOT, "src", "assets", "icons", "favicon.png");
const OUT_APPLE_TOUCH = path.join(
  ROOT,
  "src",
  "assets",
  "icons",
  "apple-touch-icon.png",
);
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_ICO = path.join(PUBLIC_DIR, "favicon.ico");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generate() {
  try {
    // Validate source SVG
    await fs.promises.access(SRC_SVG, fs.constants.R_OK);

    // Sizes for ICO
    const sizes = [16, 32, 48, 64, 128, 256];

    // Render PNG buffers from SVG
    const pngBuffers = await Promise.all(
      sizes.map((size) =>
        sharp(SRC_SVG)
          .resize(size, size, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer(),
      ),
    );

    // Write 32x32 PNG fallback used by many pages
    await fs.promises.writeFile(OUT_PNG_32, pngBuffers[sizes.indexOf(32)]);

    // Write 180x180 Apple touch icon
    const atPng = await sharp(SRC_SVG)
      .resize(180, 180, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
    await fs.promises.writeFile(OUT_APPLE_TOUCH, atPng);

    // Ensure public dir exists and write ICO
    await ensureDir(PUBLIC_DIR);
    const icoBuffer = await pngToIco(pngBuffers);
    await fs.promises.writeFile(OUT_ICO, icoBuffer);

    console.log("✓ Generated:", path.relative(ROOT, OUT_ICO));
    console.log("✓ Generated:", path.relative(ROOT, OUT_PNG_32));
    console.log("✓ Generated:", path.relative(ROOT, OUT_APPLE_TOUCH));
  } catch (err) {
    console.error("✗ Favicon generation failed:", err.message);
    // Re-throw to ensure non-zero exit without relying on Node globals in lint context
    throw err;
  }
}

generate();
