#!/usr/bin/env node
/**
 * rgba-to-modern-rgb.js (ESM)
 * Converts rgba(r, g, b, a) to modern rgb(r g b / a%) syntax in given files.
 * Usage: node rgba-to-modern-rgb.js <file1> [file2 ...]
 */
import fs from "node:fs";
import path from "node:path";

function convertRgbaToModernRgb(css) {
  // Regex to match rgba( r, g, b, a ) with flexible whitespace
  const rgbaRegex =
    /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01](?:\.\d+)?)\s*\)/gi;
  return css.replace(rgbaRegex, (_, r, g, b, a) => {
    const rr = Math.max(0, Math.min(255, parseInt(r, 10)));
    const gg = Math.max(0, Math.min(255, parseInt(g, 10)));
    const bb = Math.max(0, Math.min(255, parseInt(b, 10)));
    const alpha = parseFloat(a);
    if (alpha >= 0.999) {
      // Fully opaque -> rgb without alpha
      return `rgb(${rr} ${gg} ${bb})`;
    }
    // Use percentage with up to 2 decimals but prefer integers when possible
    let pct = alpha * 100;
    const pctRounded = Math.round(pct * 100) / 100; // 2 decimals
    // Strip trailing .0 or .00
    const pctStr =
      (Number.isInteger(pctRounded)
        ? pctRounded.toString()
        : pctRounded.toFixed(2).replace(/\.0+$/, "")) + "%";
    return `rgb(${rr} ${gg} ${bb} / ${pctStr})`;
  });
}

function processFile(filePath) {
  const abs = path.resolve(filePath);
  const css = fs.readFileSync(abs, "utf8");
  const converted = convertRgbaToModernRgb(css);
  if (converted !== css) {
    fs.writeFileSync(abs, converted, "utf8");
    console.log(`[updated] ${filePath}`);
  } else {
    console.log(`[no-change] ${filePath}`);
  }
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node rgba-to-modern-rgb.js <file1> [file2 ...]");
  process.exit(1);
}

files.forEach(processFile);
