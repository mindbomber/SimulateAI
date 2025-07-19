#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function findJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJSFiles(fullPath));
    } else if (
      item.endsWith('.js') &&
      !item.includes('test') &&
      !item.includes('spec')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function cleanConsoleLog(content) {
  let cleaned = content;
  let removedCount = 0;

  // Count original console.log occurrences
  const originalMatches = content.match(/console\.log/g);
  const originalCount = originalMatches ? originalMatches.length : 0;

  // Remove single-line console.log statements
  cleaned = cleaned.replace(/^\s*console\.log\([^;]*\);\s*$/gm, '');

  // Remove multi-line console.log statements (simple pattern)
  cleaned = cleaned.replace(/console\.log\([^)]*\);?/g, '');

  // Remove commented console.log statements
  cleaned = cleaned.replace(/^\s*\/\/\s*console\.log.*$/gm, '');

  // Clean up excessive empty lines
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Count remaining console.log occurrences
  const newMatches = cleaned.match(/console\.log/g);
  const newCount = newMatches ? newMatches.length : 0;

  removedCount = originalCount - newCount;

  return { cleaned, removedCount, originalCount };
}

function main() {
  console.log('🧹 Starting Node.js console.log cleanup...');

  const srcDir = path.join(process.cwd(), 'src', 'js');
  const files = findJSFiles(srcDir);

  let totalRemoved = 0;
  let filesModified = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { cleaned, removedCount, originalCount } = cleanConsoleLog(content);

      if (removedCount > 0) {
        fs.writeFileSync(file, cleaned);
        console.log(
          `✅ ${path.basename(file)}: Removed ${removedCount}/${originalCount} console.log statements`
        );
        totalRemoved += removedCount;
        filesModified++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n🎉 Cleanup complete!`);
  console.log(`📊 Files modified: ${filesModified}`);
  console.log(`📊 Total console.log statements removed: ${totalRemoved}`);

  // Run a quick verification
  console.log('\n🔍 Verification scan...');
  let remainingConsoleLogCount = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/console\.log/g);
      if (matches) {
        remainingConsoleLogCount += matches.length;
        console.log(
          `⚠️  ${path.basename(file)}: ${matches.length} console.log statements remaining`
        );
      }
    } catch (error) {
      // Ignore
    }
  }

  if (remainingConsoleLogCount === 0) {
    console.log('✅ No console.log statements found in processed files!');
  } else {
    console.log(
      `⚠️  ${remainingConsoleLogCount} console.log statements still remain`
    );
  }
}

main();
