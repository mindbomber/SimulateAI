import { readFileSync, writeFileSync } from 'fs';

// Read the file
const filePath = 'src/js/objects/input-utility-components.js';
const content = readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Find the DateTimePicker class boundaries
let classStart = -1;
let classEnd = -1;
let braceCount = 0;
let inClass = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('class DateTimePicker extends BaseObject')) {
    classStart = i;
    inClass = true;
    braceCount = 0;
  }

  if (inClass) {
    // Count braces on this line
    const openBraces = (lines[i].match(/\{/g) || []).length;
    const closeBraces = (lines[i].match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;

    // If we've closed all braces and this line has a closing brace, this is the end
    if (braceCount === 0 && lines[i].includes('}') && i > classStart) {
      classEnd = i;
      break;
    }
  }
}

if (classStart !== -1 && classEnd !== -1) {
  // Remove the DateTimePicker class and its preceding comments
  const commentStart = Math.max(0, classStart - 5); // Remove up to 5 lines of comments before
  let actualStart = classStart;

  // Look for the comment block before the class
  for (let i = classStart - 1; i >= commentStart; i--) {
    if (
      lines[i].includes('DATE TIME PICKER COMPONENT') ||
      lines[i].includes('=============')
    ) {
      actualStart = i;
      break;
    }
  }

  const newLines = [
    ...lines.slice(0, actualStart),
    ...lines.slice(classEnd + 1),
  ];

  writeFileSync(filePath, newLines.join('\n'));
  console.log(
    `Removed DateTimePicker class from line ${actualStart + 1} to ${classEnd + 1}`
  );
  console.log(`File reduced from ${lines.length} to ${newLines.length} lines`);
} else {
  console.log('Could not find DateTimePicker class boundaries');
  console.log(`classStart: ${classStart}, classEnd: ${classEnd}`);
}
