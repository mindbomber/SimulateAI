import { readFileSync, writeFileSync } from 'fs';

// Read the file
const filePath = 'src/js/objects/input-utility-components.js';
const content = readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

// Find the index where the orphaned code starts and the DateTimePicker class begins
let orphanedStart = -1;
let dateTimePickerStart = -1;

for (let i = 0; i < lines.length; i++) {
  // Look for the first orphaned method (validateOptions)
  if (
    lines[i].trim().startsWith('validateOptions(options)') &&
    orphanedStart === -1
  ) {
    orphanedStart = i;
  }

  // Look for the DateTimePicker class
  if (lines[i].includes('class DateTimePicker extends BaseObject')) {
    dateTimePickerStart = i;
    break;
  }
}

if (orphanedStart !== -1 && dateTimePickerStart !== -1) {
  // Remove the orphaned code between these two points
  const newLines = [
    ...lines.slice(0, orphanedStart),
    ...lines.slice(dateTimePickerStart),
  ];

  writeFileSync(filePath, newLines.join('\n'));
  console.log(
    `Removed orphaned code from line ${orphanedStart + 1} to ${dateTimePickerStart}`
  );
  console.log(`File reduced from ${lines.length} to ${newLines.length} lines`);
} else {
  console.log('Could not find orphaned code or DateTimePicker class');
  console.log(
    `orphanedStart: ${orphanedStart}, dateTimePickerStart: ${dateTimePickerStart}`
  );
}
