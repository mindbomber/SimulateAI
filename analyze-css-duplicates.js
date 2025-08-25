#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// List of duplicate selectors found by stylelint
const duplicateSelectors = [
  // advanced-ui-components.css
  {
    file: "src/styles/advanced-ui-components.css",
    selector: ".modal-backdrop",
    lines: [57, 1001, 1457],
  },
  {
    file: "src/styles/advanced-ui-components.css",
    selector: ".navigation-menu",
    lines: [302, 1099],
  },
  {
    file: "src/styles/advanced-ui-components.css",
    selector: ".modal-footer",
    lines: [183, 1446],
  },
  {
    file: "src/styles/advanced-ui-components.css",
    selector: ".modal-dialog",
    lines: [80, 1477],
  },

  // badge-modal.css
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-visual-container",
    lines: [54, 480],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-shield",
    lines: [60, 487],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-shield-emoji",
    lines: [91, 518],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-category-emoji",
    lines: [99, 538],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-sidekick-emoji",
    lines: [111, 565],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-modal-content",
    lines: [42, 669],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-title",
    lines: [632, 686],
  },
  {
    file: "src/styles/badge-modal.css",
    selector: ".badge-quote",
    lines: [598, 697],
  },

  // category-grid.css
  {
    file: "src/styles/category-grid.css",
    selector: ".scenario-card-wrapper",
    lines: [242, 300, 393],
  },
  {
    file: "src/styles/category-grid.css",
    selector: ".scenario-hover-category-header",
    lines: [250, 398],
  },
  {
    file: "src/styles/category-grid.css",
    selector: ".scenarios-grid",
    lines: [1031, 1123, 1153, 1239],
  },
  {
    file: "src/styles/category-grid.css",
    selector: ".scenarios-grid:hover",
    lines: [1133, 1205],
  },
  {
    file: "src/styles/category-grid.css",
    selector: ".category-header",
    lines: [1506, 1513],
  },
  {
    file: "src/styles/category-grid.css",
    selector: ".category-icon-large",
    lines: [1528, 1560],
  },

  // shared-navigation.css
  {
    file: "src/styles/shared-navigation.css",
    selector: "display",
    lines: [119, 206],
  }, // duplicate property

  // settings-menu.css
  {
    file: "src/styles/settings-menu.css",
    selector: ".settings-menu",
    lines: [29, 50],
  },

  // simulations.css
  {
    file: "src/styles/simulations.css",
    selector: ".feedback-positive",
    lines: [218, 745],
  },
  {
    file: "src/styles/simulations.css",
    selector: ".feedback-negative",
    lines: [223, 751],
  },
  {
    file: "src/styles/simulations.css",
    selector: ".feedback-neutral",
    lines: [228, 757],
  },
  {
    file: "src/styles/simulations.css",
    selector: ".feedback-excellent",
    lines: [233, 763],
  },
  {
    file: "src/styles/simulations.css",
    selector: ".feedback-concerning",
    lines: [238, 769],
  },
  {
    file: "src/styles/simulations.css",
    selector: ".interactive-element.dragging",
    lines: [351, 894],
  },
  {
    file: "src/styles/simulations.css",
    selector: ".simulation-instructions",
    lines: [1082, 1116],
  },
];

async function analyzeDuplicates() {
  console.log("🔍 Analyzing CSS duplicate selectors...\n");

  const results = [];

  for (const duplicate of duplicateSelectors) {
    const filePath = duplicate.file;
    const selector = duplicate.selector;

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    console.log(`\n📂 File: ${filePath}`);
    console.log(`🎯 Duplicate selector: ${selector}`);

    const instances = [];
    duplicate.lines.forEach((lineNum, index) => {
      if (lineNum <= lines.length) {
        const line = lines[lineNum - 1];
        instances.push({
          line: lineNum,
          content: line.trim(),
          context: lines
            .slice(Math.max(0, lineNum - 3), lineNum + 2)
            .map((l, i) => `${lineNum - 2 + i}: ${l}`)
            .join("\n"),
        });
        console.log(`   Line ${lineNum}: ${line.trim()}`);
      }
    });

    results.push({
      file: filePath,
      selector,
      instances,
      recommendation: generateRecommendation(selector, instances),
    });
  }

  return results;
}

function generateRecommendation(selector, instances) {
  // Simple heuristics for recommendations
  if (instances.length === 2) {
    return "MERGE: Combine the two instances into one rule or use more specific selectors";
  } else if (instances.length > 2) {
    return "CONSOLIDATE: Multiple instances found - consider creating a single comprehensive rule";
  }

  // Check if instances are in different media queries or contexts
  const hasMediaQuery = instances.some(
    (inst) =>
      inst.context.includes("@media") || inst.context.includes("@supports"),
  );

  if (hasMediaQuery) {
    return "CONTEXT_SPECIFIC: Different instances for different media queries - may be intentional";
  }

  return "REVIEW: Manual review needed to determine best consolidation approach";
}

async function generateFixScript() {
  console.log("\n🔧 Generating CSS duplicate fix script...\n");

  const results = await analyzeDuplicates();

  // Generate a report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: [...new Set(results.map((r) => r.file))].length,
    totalDuplicates: results.length,
    results: results,
  };

  fs.writeFileSync(
    "css-duplicate-analysis.json",
    JSON.stringify(report, null, 2),
  );

  // Generate fix script
  const fixScript = `#!/usr/bin/env node
/*
 * CSS Duplicate Selector Fix Script
 * Generated: ${new Date().toISOString()}
 * 
 * This script provides recommendations and automated fixes for duplicate CSS selectors
 */

const fs = require('fs');

const fixes = ${JSON.stringify(results, null, 2)};

console.log('🔧 CSS Duplicate Selector Fix Report');
console.log('=====================================\\n');

fixes.forEach((fix, index) => {
  console.log(\`\${index + 1}. File: \${fix.file}\`);
  console.log(\`   Selector: \${fix.selector}\`);
  console.log(\`   Instances: \${fix.instances.length}\`);
  console.log(\`   Recommendation: \${fix.recommendation}\\n\`);
  
  fix.instances.forEach((instance, i) => {
    console.log(\`   Instance \${i + 1} (Line \${instance.line}):\`);
    console.log(\`   \${instance.content}\\n\`);
  });
  
  console.log('   ---\\n');
});

console.log('\\n📋 Summary:');
console.log(\`Total files with duplicates: \${[...new Set(fixes.map(f => f.file))].length}\`);
console.log(\`Total duplicate selectors: \${fixes.length}\`);
console.log('\\n💡 Next steps:');
console.log('1. Review each duplicate manually');
console.log('2. Merge or rename selectors as appropriate');
console.log('3. Run stylelint again to verify fixes');
`;

  fs.writeFileSync("fix-css-duplicates.js", fixScript);

  console.log("✅ Generated files:");
  console.log("   📄 css-duplicate-analysis.json - Detailed analysis");
  console.log("   🔧 fix-css-duplicates.js - Fix script");

  return results;
}

// Run the analysis
const results = await generateFixScript();
console.log(
  `\n🎉 Analysis complete! Found ${results.length} duplicate selectors.`,
);
console.log("\nRun: node fix-css-duplicates.js to see the detailed report.");

export { analyzeDuplicates, generateFixScript };
