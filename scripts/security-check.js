#!/usr/bin/env node
/*
  Pre-commit security check with practical allowlist:
  - Scans staged additions for sensitive patterns.
  - Ignores build output (.vite, dist), trash, and docs.
  - Allows Firebase Web API keys (AIza...) inside firebase-config.* files.
*/
const { execSync } = require('node:child_process');

const IGNORE_PATHS = [
  /^dist\//,
  /^\.vite\//,
  /^\.trash\//,
  /^docs\//,
  /^scripts\/security-check\.js$/, // ignore this script to avoid self-flagging
];
const ALLOWLIST_FILE = [/firebase-config/i];
const SUSPICIOUS = [
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /sk_live_\w{10,}/i,
  /secret(=|\s*:)/i,
  /password(=|\s*:)/i,
  /token(=|\s*:)/i,
  /AWS_(ACCESS|SECRET)_KEY/i,
  /-----BEGIN/,
];
// Firebase Web apiKey often matches /AIza[0-9A-Za-z\-_]{35}/; allow unless not in allowlisted files
const FIREBASE_KEY = /AIza[0-9A-Za-z\-_]{10,}/;

function isIgnored(path) { return IGNORE_PATHS.some((re) => re.test(path)); }
function isAllowlisted(path) { return ALLOWLIST_FILE.some((re) => re.test(path)); }

function getStagedFiles() {
  return execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getStagedDiff() {
  // Only added/changed lines
  return execSync('git diff --cached -U0', { encoding: 'utf8' });
}

function main() {
  console.log('🔐 Running pre-commit security check...');
  const files = getStagedFiles();
  const diff = getStagedDiff();
  let violations = [];

  const fileSet = new Set(files);
  const lines = diff.split('\n');
  let currentFile = null;

  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6);
      continue;
    }
    if (!currentFile || isIgnored(currentFile)) continue;
    if (!fileSet.has(currentFile)) continue;
    if (!line.startsWith('+') || line.startsWith('+++')) continue; // only added content

    const content = line.slice(1);

    // Hard blockers
    if (SUSPICIOUS.some((re) => re.test(content))) {
      violations.push({ file: currentFile, line: content });
      continue;
    }

    // Firebase key handling
    if (FIREBASE_KEY.test(content) && !isAllowlisted(currentFile)) {
      violations.push({ file: currentFile, line: content });
    }
  }

  if (violations.length) {
    console.error('❌ ERROR: Potential secret detected in staged changes!');
    for (const v of violations.slice(0, 10)) {
      console.error(` -> ${v.file}: ${v.line.substring(0, 200)}`);
    }
    console.error('💡 Tip: Unstage build outputs (dist/.vite), .env files, and move real secrets to environment.');
    process.exit(1);
  }

  console.log('✅ Security check passed.');
}

try { main(); } catch (e) { console.error('⚠️ Security check failed to run:', e.message); process.exit(1); }
