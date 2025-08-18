#!/usr/bin/env node
/* global process */
/*
  Cleanup Legacy Files
  - Finds legacy markdown reports and test/demo files
  - By default, dry-run only (prints what would be moved)
  - Use --apply to move files into .trash/<timestamp>/ preserving structure

  Usage:
    node scripts/cleanup-legacy-files.js          # dry run
    node scripts/cleanup-legacy-files.js --apply  # move to .trash

  Options:
    --apply           Apply changes (move files to .trash)
    --trash=<path>    Custom trash directory (default: .trash)
    --root=<path>     Root to scan (default: process.cwd())
*/

import fsp from 'fs/promises';
import path from 'path';

const CWD = process.cwd();
const args = process.argv.slice(2);
const options = Object.fromEntries(
  args
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    })
);

const APPLY = Boolean(options.apply === true || options.apply === 'true');
const ROOT = path.resolve(options.root ? String(options.root) : CWD);
const TRASH_BASE = path.resolve(ROOT, String(options.trash || '.trash'));
const TS = new Date()
  .toISOString()
  .replace(/[:.]/g, '-')
  .replace('T', '_')
  .slice(0, 19);
const TRASH_DIR = path.join(TRASH_BASE, TS);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.trash',
  '.vscode',
  '.github',
]);

const mdPatterns = [
  /_COMPLETE\.md$/i,
  /_SUMMARY\.md$/i,
  /_GUIDE\.md$/i,
  /_ANALYSIS.*\.md$/i,
  /_FIX.*\.md$/i,
  /_MIGRATION.*\.md$/i,
  /_IMPLEMENTATION.*\.md$/i,
  /_STATUS.*\.md$/i,
  /_INTEGRATION.*\.md$/i,
];

const testDemoPatterns = [
  /-test\.html$/i,
  /-demo\.html$/i,
  /-debug.*\.html$/i,
  /-test\.js$/i,
  /-demo.*\.js$/i,
  /-debug.*\.js$/i,
];

function isLegacyMd(file) {
  return mdPatterns.some((re) => re.test(file));
}

function isTestOrDemo(file) {
  return testDemoPatterns.some((re) => re.test(file));
}

async function* walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function moveToTrash(absFile) {
  const rel = path.relative(ROOT, absFile);
  const dest = path.join(TRASH_DIR, rel);
  await ensureDir(path.dirname(dest));
  await fsp.rename(absFile, dest);
  return dest;
}

function formatCount(n) {
  return String(n).padStart(5, ' ');
}

(async () => {
  const legacyMd = [];
  const testDemo = [];
  for await (const file of walk(ROOT)) {
    const base = path.basename(file);
    if (isLegacyMd(base)) {
      legacyMd.push(file);
      continue;
    }
    if (isTestOrDemo(base)) {
      testDemo.push(file);
    }
  }

  legacyMd.sort();
  testDemo.sort();

  console.log(`Scan root: ${ROOT}`);
  console.log(`Apply mode: ${APPLY ? 'YES (move to .trash)' : 'NO (dry run)'}`);
  console.log('');
  console.log(`Legacy .md files: ${formatCount(legacyMd.length)}`);
  console.log(`Test/Demo files : ${formatCount(testDemo.length)}`);
  console.log('');

  const preview = (arr, label) => {
    if (arr.length === 0) return;
    console.log(`First ${Math.min(arr.length, 20)} ${label}:`);
    arr.slice(0, 20).forEach((f) => console.log('  ' + path.relative(ROOT, f)));
    if (arr.length > 20) console.log(`  ... and ${arr.length - 20} more`);
    console.log('');
  };

  preview(legacyMd, 'legacy .md');
  preview(testDemo, 'test/demo');

  if (!APPLY) {
    console.log('Dry run complete. Re-run with --apply to move files to .trash.');
    console.log('Example: npm run cleanup:legacy:apply');
    return;
  }

  await ensureDir(TRASH_DIR);

  let moved = 0;
  for (const file of [...legacyMd, ...testDemo]) {
    try {
      await moveToTrash(file);
      moved++;
    } catch (err) {
      console.error('Failed to move:', path.relative(ROOT, file), err.message);
    }
  }

  console.log(`Moved ${moved} files to: ${TRASH_DIR}`);
  console.log('Review and delete permanently when ready.');
})();
