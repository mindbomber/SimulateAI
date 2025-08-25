/**
 * Google Analytics Auto-Injection Script
 * Automatically adds GA4 tracking code to all HTML pages
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const GA_TAG = `    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-4SVB78MBHN"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-4SVB78MBHN');
    </script>
`;

/**
 * Add GA tag to HTML file if not already present
 * @param {string} filePath - Path to HTML file
 */
function addGATagToFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Check if GA tag already exists
    if (content.includes("googletagmanager.com/gtag/js?id=G-4SVB78MBHN")) {
      console.log(`✓ GA tag already exists in: ${filePath}`);
      return false;
    }

    // Find the <head> tag and add GA tag after it
    const headRegex = /(<head[^>]*>)/i;
    if (headRegex.test(content)) {
      const updatedContent = content.replace(headRegex, `$1\n${GA_TAG}`);
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✓ Added GA tag to: ${filePath}`);
      return true;
    } else {
      console.log(`⚠ No <head> tag found in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process all HTML files in the project
 */
function processAllHTMLFiles() {
  console.log("🔍 Searching for HTML files...");

  // Find all HTML files, excluding node_modules and other irrelevant directories
  const htmlFiles = glob.sync("**/*.html", {
    ignore: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "coverage/**",
    ],
  });

  console.log(`📄 Found ${htmlFiles.length} HTML files`);

  let processed = 0;
  let updated = 0;

  htmlFiles.forEach((file) => {
    processed++;
    if (addGATagToFile(file)) {
      updated++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${processed}`);
  console.log(`   Files updated: ${updated}`);
  console.log(`   Files already had GA: ${processed - updated}`);

  if (updated > 0) {
    console.log(
      `\n✅ Google Analytics successfully added to ${updated} HTML files!`,
    );
  } else {
    console.log(
      `\n✅ All HTML files already have Google Analytics configured!`,
    );
  }
}

// Run the script
if (require.main === module) {
  console.log("🚀 Starting Google Analytics injection...\n");
  processAllHTMLFiles();
}

module.exports = { addGATagToFile, processAllHTMLFiles };
