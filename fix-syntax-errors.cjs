const fs = require('fs');
const path = require('path');

function fixBrokenArrowFunctions(content) {
  // Fix broken arrow functions like "() => ,"
  let fixed = content.replace(
    /action:\s*\(\)\s*=>\s*,/g,
    'action: () => { /* action removed */ },'
  );

  // Fix other broken arrow function patterns
  fixed = fixed.replace(/=>\s*,/g, '=> { /* removed */ },');
  fixed = fixed.replace(/=>\s*\)/g, '=> { /* removed */ })');

  return fixed;
}

function findAndFixFiles(dir) {
  const files = fs.readdirSync(dir);
  let fixedFiles = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      fixedFiles += findAndFixFiles(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const fixed = fixBrokenArrowFunctions(content);

        if (fixed !== content) {
          fs.writeFileSync(fullPath, fixed);
          console.log(`✅ Fixed syntax in ${file}`);
          fixedFiles++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
  }

  return fixedFiles;
}

console.log('🔧 Fixing syntax errors from console.log cleanup...');
const srcDir = path.join(process.cwd(), 'src');
const fixedCount = findAndFixFiles(srcDir);
console.log(`🎉 Fixed syntax errors in ${fixedCount} files`);
