/**
 * Remove NumberInput Component from Main File
 * Automated script to safely remove the NumberInput class and related constants
 * while preserving all other code.
 */

const fs = require('fs');
const path = require('path');

const inputFile = './src/js/objects/input-utility-components.js';

function removeNumberInputFromMainFile() {
  try {
    // Read the current file
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');

    console.log(`📖 Original file: ${lines.length} lines`);

    // Find the start and end of the NumberInput class
    let startIndex = -1;
    let endIndex = -1;

    // Find class NumberInput extends BaseObject {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('class NumberInput extends BaseObject')) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      console.log('❌ NumberInput class not found');
      return;
    }

    console.log(`🎯 Found NumberInput class at line ${startIndex + 1}`);

    // Find the end of the class (look for the next class or end of file)
    let braceCount = 0;
    let inClass = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('class NumberInput extends BaseObject')) {
        inClass = true;
      }

      if (inClass) {
        // Count braces to find class end
        const openBraces = (line.match(/{/g) || []).length;
        const closeBraces = (line.match(/}/g) || []).length;
        braceCount += openBraces - closeBraces;

        // If we're back to 0 braces, we've found the end
        if (braceCount === 0 && i > startIndex) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex === -1) {
      console.log('❌ Could not find end of NumberInput class');
      return;
    }

    console.log(`🎯 NumberInput class ends at line ${endIndex + 1}`);
    console.log(
      `📏 NumberInput class spans ${endIndex - startIndex + 1} lines`
    );

    // Remove the NumberInput class and any related comments
    const beforeClass = lines.slice(0, startIndex);
    const afterClass = lines.slice(endIndex + 1);

    // Look backwards from startIndex to find and remove section comments
    let commentsStartIndex = startIndex;
    for (let i = startIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (
        line === '' ||
        line.startsWith('//') ||
        line.startsWith('*') ||
        line.includes('NUMBER INPUT COMPONENT') ||
        line.includes('=============')
      ) {
        commentsStartIndex = i;
      } else {
        break;
      }
    }

    if (commentsStartIndex < startIndex) {
      console.log(
        `🧹 Removing comments from line ${commentsStartIndex + 1} to ${startIndex}`
      );
    }

    // Create the new content
    const beforeComments = lines.slice(0, commentsStartIndex);
    const newContent = [...beforeComments, ...afterClass].join('\n');

    // Backup the original file
    const backupFile = `${inputFile}.backup.${Date.now()}`;
    fs.writeFileSync(backupFile, content);
    console.log(`💾 Backup created: ${backupFile}`);

    // Write the new content
    fs.writeFileSync(inputFile, newContent);

    const newLines = newContent.split('\n');
    const removedLines = lines.length - newLines.length;

    console.log(`✅ NumberInput removal complete!`);
    console.log(`📊 Removed ${removedLines} lines`);
    console.log(`📖 New file: ${newLines.length} lines`);
    console.log(
      `📉 File size reduction: ${((removedLines / lines.length) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error('❌ Error removing NumberInput:', error);
  }
}

// Execute the removal
removeNumberInputFromMainFile();
