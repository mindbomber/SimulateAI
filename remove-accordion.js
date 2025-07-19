import { readFileSync, writeFileSync } from 'fs';

// Read the file
const filePath = 'src/js/objects/input-utility-components.js';
const content = readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Process lines to remove Accordion class
const output = [];
let skip = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Start skipping when we find the Accordion class
  if (line.includes('class Accordion extends BaseObject')) {
    skip = true;
    braceCount = 0;
    continue;
  }

  if (skip) {
    // Count braces to find the end of the class
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;

    // If we've closed all braces and this line has a closing brace, stop skipping
    if (braceCount === 0 && line.includes('}')) {
      skip = false;
      continue;
    }
  }

  if (!skip) {
    output.push(line);
  }
}

// Write the modified content back to the file
writeFileSync(filePath, output.join('\n'));
console.log('Accordion class removed successfully');
console.log(`File reduced from ${lines.length} to ${output.length} lines`);
