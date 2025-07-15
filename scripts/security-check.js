#!/usr/bin/env node
/**
 * Pre-commit security check script
 * Prevents commits containing sensitive information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-commit security checks...');

// Get staged files
let stagedFiles;
try {
  stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.trim() && !file.startsWith('.git/'));
} catch (error) {
  console.log('⚠️ Could not get staged files, running on all files');
  stagedFiles = [];
}

const errors = [];
const warnings = [];

// Security patterns to check for
const securityPatterns = [
  {
    pattern: /AIzaSy[A-Za-z0-9_-]{35}/g,
    message: 'Firebase API key detected',
    severity: 'error',
  },
  {
    pattern: /pk_live_[A-Za-z0-9]{99,}/g,
    message: 'Stripe live publishable key detected',
    severity: 'error',
  },
  {
    pattern: /sk_live_[A-Za-z0-9]{99,}/g,
    message: 'Stripe live secret key detected',
    severity: 'error',
  },
  {
    pattern: /rk_live_[A-Za-z0-9]{99,}/g,
    message: 'Stripe live restricted key detected',
    severity: 'error',
  },
  {
    pattern: /whsec_[A-Za-z0-9]{32,}/g,
    message: 'Webhook secret detected',
    severity: 'error',
  },
  {
    pattern: /"[a-f0-9]{40,}"/g,
    message: 'Potential secret token detected (40+ hex chars)',
    severity: 'warning',
  },
  {
    pattern: /password\s*[:=]\s*["'][^"']{8,}["']/gi,
    message: 'Potential hardcoded password detected',
    severity: 'warning',
  },
  {
    pattern: /secret\s*[:=]\s*["'][^"']{8,}["']/gi,
    message: 'Potential hardcoded secret detected',
    severity: 'warning',
  },
];

// Files to check (if no staged files, check common file types)
const filesToCheck =
  stagedFiles.length > 0
    ? stagedFiles.filter(file => /\.(js|html|json|ts|jsx|tsx)$/.test(file))
    : [];

// Add all JS/HTML files if no staged files
if (filesToCheck.length === 0) {
  const getAllFiles = (dir, extensions) => {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !['node_modules', '.git', 'dist'].includes(item)
      ) {
        files.push(...getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    return files;
  };

  filesToCheck.push(...getAllFiles('src', ['.js', '.html']));
  filesToCheck.push(
    ...getAllFiles('.', ['.html']).filter(f => !f.includes('node_modules'))
  );
}

console.log(`📁 Checking ${filesToCheck.length} files...`);

// Check each file
for (const file of filesToCheck) {
  if (!fs.existsSync(file)) continue;

  try {
    const content = fs.readFileSync(file, 'utf8');

    // Skip if file is too large (>1MB)
    if (content.length > 1024 * 1024) {
      console.log(`⏩ Skipping large file: ${file}`);
      continue;
    }

    // Check against security patterns
    for (const { pattern, message, severity } of securityPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Filter out safe patterns
        const dangerousMatches = matches.filter(match => {
          const lowerMatch = match.toLowerCase();
          return (
            !lowerMatch.includes('example') &&
            !lowerMatch.includes('template') &&
            !lowerMatch.includes('placeholder') &&
            !lowerMatch.includes('your_') &&
            !lowerMatch.includes('_here') &&
            !lowerMatch.includes('test') &&
            !lowerMatch.includes('mock') &&
            !lowerMatch.includes('dummy')
          );
        });

        if (dangerousMatches.length > 0) {
          const issue = `${file}: ${message} (${dangerousMatches.length} occurrences)`;
          if (severity === 'error') {
            errors.push(issue);
          } else {
            warnings.push(issue);
          }
        }
      }
    }
  } catch (error) {
    console.log(`⚠️ Could not read file: ${file}`);
  }
}

// Check .env file existence and .gitignore protection
if (fs.existsSync('.env')) {
  const gitignoreContent = fs.existsSync('.gitignore')
    ? fs.readFileSync('.gitignore', 'utf8')
    : '';

  if (!gitignoreContent.includes('.env')) {
    errors.push('.env file exists but not in .gitignore!');
  } else {
    console.log('✅ .env file properly ignored');
  }
}

// Check Firebase service configuration
const firebaseServicePath = 'src/js/services/firebase-service.js';
if (fs.existsSync(firebaseServicePath)) {
  const firebaseContent = fs.readFileSync(firebaseServicePath, 'utf8');

  // Check for proper environment variable usage
  if (
    !firebaseContent.includes('import.meta.env') &&
    !firebaseContent.includes('window.envConfig')
  ) {
    errors.push('Firebase service not using environment variables');
  }

  // Check for error throwing when env vars missing
  if (
    !firebaseContent.includes('throw new Error') ||
    !firebaseContent.includes('environment')
  ) {
    warnings.push(
      'Firebase service should throw errors for missing environment variables'
    );
  }
}

// Report results
console.log('\n📊 Security Check Results:');

if (errors.length > 0) {
  console.log('\n❌ ERRORS (blocking commit):');
  errors.forEach(error => console.log(`   • ${error}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️ WARNINGS:');
  warnings.forEach(warning => console.log(`   • ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ No security issues found!');
}

// Exit with error code if there are blocking issues
if (errors.length > 0) {
  console.log('\n🚫 Commit blocked due to security issues!');
  console.log('💡 Fix the errors above before committing.');
  process.exit(1);
} else {
  console.log('\n🚀 Security check passed - commit allowed!');
  process.exit(0);
}
