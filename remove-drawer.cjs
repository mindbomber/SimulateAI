/**
 * Remove Drawer Component from Main File
 * Automated script to safely remove the Drawer class and related constants
 * while preserving all other code.
 */

const fs = require('fs');

const inputFile = './src/js/objects/input-utility-components.js';

function removeDrawerFromMainFile() {
  try {
    // Read the current file
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');

    // eslint-disable-next-line no-console
    console.log(`📖 Original file: ${lines.length} lines`);

    // Find the start and end of the Drawer class
    let startIndex = -1;
    let endIndex = -1;

    // Find class Drawer extends BaseObject {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('class Drawer extends BaseObject')) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      // eslint-disable-next-line no-console
      console.log('❌ Drawer class not found');
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`🎯 Found Drawer class at line ${startIndex + 1}`);

    // Find the end of the class (look for the next class or end of file)
    let braceCount = 0;
    let inClass = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('class Drawer extends BaseObject')) {
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
      // eslint-disable-next-line no-console
      console.log('❌ Could not find end of Drawer class');
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`🎯 Drawer class ends at line ${endIndex + 1}`);
    // eslint-disable-next-line no-console
    console.log(`📏 Drawer class spans ${endIndex - startIndex + 1} lines`);

    // Look backwards from startIndex to find and remove section comments
    let commentsStartIndex = startIndex;
    for (let i = startIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (
        line === '' ||
        line.startsWith('//') ||
        line.startsWith('*') ||
        line.includes('DRAWER COMPONENT') ||
        line.includes('=============')
      ) {
        commentsStartIndex = i;
      } else {
        break;
      }
    }

    if (commentsStartIndex < startIndex) {
      // eslint-disable-next-line no-console
      console.log(
        `🧹 Removing comments from line ${commentsStartIndex + 1} to ${startIndex}`
      );
    }

    // Create the new content
    const beforeComments = lines.slice(0, commentsStartIndex);
    const afterClass = lines.slice(endIndex + 1);
    const newContent = [...beforeComments, ...afterClass].join('\n');

    // Backup the original file
    const backupFile = `${inputFile}.backup.${Date.now()}`;
    fs.writeFileSync(backupFile, content);
    // eslint-disable-next-line no-console
    console.log(`💾 Backup created: ${backupFile}`);

    // Write the new content
    fs.writeFileSync(inputFile, newContent);

    const newLines = newContent.split('\n');
    const removedLines = lines.length - newLines.length;

    // eslint-disable-next-line no-console
    console.log(`✅ Drawer removal complete!`);
    // eslint-disable-next-line no-console
    console.log(`📊 Removed ${removedLines} lines`);
    // eslint-disable-next-line no-console
    console.log(`📖 New file: ${newLines.length} lines`);
    // eslint-disable-next-line no-console
    console.log(
      `📉 File size reduction: ${((removedLines / lines.length) * 100).toFixed(1)}%`
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error removing Drawer:', error);
  }
}

// Execute the removal
removeDrawerFromMainFile();
