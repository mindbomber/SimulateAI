/**
 * CSS Selector Usage Pattern Analysis for ui.js
 * Extracts and analyzes all CSS class names, selectors, and usage patterns
 */

import fs from "fs";

const UI_FILE_PATH = "./src/js/core/ui.js";

class CSSAnalyzer {
  constructor() {
    this.results = {
      // CSS classes defined in global stylesheet
      globalStylesheetClasses: [],

      // CSS classes used in JavaScript code
      jsUsedClasses: [],

      // querySelector/querySelectorAll patterns
      selectorPatterns: [],

      // CSS class assignments (className, classList operations)
      classAssignments: [],

      // Dynamic class names (template literals, string concatenation)
      dynamicClasses: [],

      // CSS selectors in global stylesheet
      stylesheetSelectors: [],

      // Analysis results
      analysis: {
        unused: [],
        missing: [],
        duplicates: [],
        patterns: [],
      },
    };
  }

  analyzeFile() {
    console.log("🔍 Analyzing CSS selector usage patterns in ui.js...\n");

    try {
      const content = fs.readFileSync(UI_FILE_PATH, "utf8");

      this.extractGlobalStylesheetClasses(content);
      this.extractJSUsedClasses(content);
      this.extractSelectorPatterns(content);
      this.extractClassAssignments(content);
      this.extractDynamicClasses(content);
      this.performAnalysis();
      this.generateReport();
    } catch (error) {
      console.error("❌ Error analyzing file:", error.message);
    }
  }

  extractGlobalStylesheetClasses(content) {
    console.log("📋 Extracting CSS classes from global stylesheet...");

    // Extract the CSS content from UIStyleManager.addGlobalStyles()
    const stylesheetMatch = content.match(/style\.textContent = `([\s\S]*?)`;/);

    if (stylesheetMatch) {
      const cssContent = stylesheetMatch[1];

      // Extract class selectors (.class-name)
      const classMatches = cssContent.match(/\.[a-zA-Z-_][a-zA-Z0-9-_]*/g);
      if (classMatches) {
        this.results.globalStylesheetClasses = [
          ...new Set(classMatches.map((cls) => cls.substring(1))),
        ];
      }

      // Extract complex selectors
      const selectorMatches = cssContent.match(
        /^[ ]*\/\*.*?\*\/[ ]*\n[ ]*([^{]+)\s*{/gm,
      );
      if (selectorMatches) {
        this.results.stylesheetSelectors = selectorMatches.map((match) =>
          match
            .replace(/^[ ]*\/\*.*?\*\/[ ]*\n[ ]*/, "")
            .replace(/\s*{$/, "")
            .trim(),
        );
      }
    }

    console.log(
      `  ✅ Found ${this.results.globalStylesheetClasses.length} CSS classes`,
    );
    console.log(
      `  ✅ Found ${this.results.stylesheetSelectors.length} CSS selectors`,
    );
  }

  extractJSUsedClasses(content) {
    console.log("🔧 Extracting CSS classes used in JavaScript...");

    // Pattern 1: String literals with CSS class names
    const stringClassMatches = content.match(/"[a-zA-Z-_][a-zA-Z0-9-_]*"/g);
    if (stringClassMatches) {
      stringClassMatches.forEach((match) => {
        const className = match.slice(1, -1); // Remove quotes
        if (this.isLikelyCSSClass(className)) {
          this.results.jsUsedClasses.push(className);
        }
      });
    }

    // Pattern 2: Single quoted strings
    const singleQuoteMatches = content.match(/'[a-zA-Z-_][a-zA-Z0-9-_]*'/g);
    if (singleQuoteMatches) {
      singleQuoteMatches.forEach((match) => {
        const className = match.slice(1, -1); // Remove quotes
        if (this.isLikelyCSSClass(className)) {
          this.results.jsUsedClasses.push(className);
        }
      });
    }

    // Pattern 3: class="..." in template literals
    const templateClassMatches = content.match(/class="([^"]*)"/g);
    if (templateClassMatches) {
      templateClassMatches.forEach((match) => {
        const classes = match.match(/class="([^"]*)"/)[1].split(" ");
        classes.forEach((cls) => {
          if (cls.trim() && this.isLikelyCSSClass(cls.trim())) {
            this.results.jsUsedClasses.push(cls.trim());
          }
        });
      });
    }

    // Remove duplicates
    this.results.jsUsedClasses = [...new Set(this.results.jsUsedClasses)];

    console.log(
      `  ✅ Found ${this.results.jsUsedClasses.length} CSS classes used in JS`,
    );
  }

  extractSelectorPatterns(content) {
    console.log("🎯 Extracting querySelector patterns...");

    // querySelector and querySelectorAll patterns
    const selectorMatches = content.match(
      /(querySelector(?:All)?)\s*\(\s*["']([^"']+)["']\s*\)/g,
    );
    if (selectorMatches) {
      selectorMatches.forEach((match) => {
        const selectorMatch = match.match(
          /(querySelector(?:All)?)\s*\(\s*["']([^"']+)["']\s*\)/,
        );
        if (selectorMatch) {
          this.results.selectorPatterns.push({
            method: selectorMatch[1],
            selector: selectorMatch[2],
            line: this.findLineNumber(content, match),
          });
        }
      });
    }

    console.log(
      `  ✅ Found ${this.results.selectorPatterns.length} selector patterns`,
    );
  }

  extractClassAssignments(content) {
    console.log("📝 Extracting class assignments...");

    // classList operations
    const classListMatches = content.match(
      /\.classList\.(add|remove|toggle|contains)\s*\(\s*["']([^"']+)["']\s*\)/g,
    );
    if (classListMatches) {
      classListMatches.forEach((match) => {
        const classMatch = match.match(
          /\.classList\.(add|remove|toggle|contains)\s*\(\s*["']([^"']+)["']\s*\)/,
        );
        if (classMatch) {
          this.results.classAssignments.push({
            operation: classMatch[1],
            className: classMatch[2],
            line: this.findLineNumber(content, match),
          });
        }
      });
    }

    // className assignments
    const classNameMatches = content.match(
      /\.className\s*=\s*["']([^"']+)["']/g,
    );
    if (classNameMatches) {
      classNameMatches.forEach((match) => {
        const classMatch = match.match(/\.className\s*=\s*["']([^"']+)["']/);
        if (classMatch) {
          const classes = classMatch[1].split(" ");
          classes.forEach((cls) => {
            if (cls.trim()) {
              this.results.classAssignments.push({
                operation: "assign",
                className: cls.trim(),
                line: this.findLineNumber(content, match),
              });
            }
          });
        }
      });
    }

    console.log(
      `  ✅ Found ${this.results.classAssignments.length} class assignments`,
    );
  }

  extractDynamicClasses(content) {
    console.log("⚡ Extracting dynamic class patterns...");

    // Template literals with interpolation
    const templateMatches = content.match(/`[^`]*\${[^}]*}[^`]*`/g);
    if (templateMatches) {
      templateMatches.forEach((match) => {
        // Look for class-like patterns in template literals
        const classPatterns = match.match(
          /[a-zA-Z-_][a-zA-Z0-9-_]*-\${[^}]*}/g,
        );
        if (classPatterns) {
          classPatterns.forEach((pattern) => {
            this.results.dynamicClasses.push({
              pattern,
              context: match,
              line: this.findLineNumber(content, match),
            });
          });
        }
      });
    }

    // String concatenation for class names
    const concatMatches = content.match(
      /["'][a-zA-Z-_][a-zA-Z0-9-_]*["']\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$]*/g,
    );
    if (concatMatches) {
      concatMatches.forEach((match) => {
        this.results.dynamicClasses.push({
          pattern: match,
          context: "string concatenation",
          line: this.findLineNumber(content, match),
        });
      });
    }

    console.log(
      `  ✅ Found ${this.results.dynamicClasses.length} dynamic class patterns`,
    );
  }

  performAnalysis() {
    console.log("\n📊 Performing analysis...");

    // Find unused classes in stylesheet
    const usedClasses = new Set([
      ...this.results.jsUsedClasses,
      ...this.results.classAssignments.map((ca) => ca.className),
    ]);

    this.results.analysis.unused = this.results.globalStylesheetClasses.filter(
      (cls) => !usedClasses.has(cls),
    );

    // Find missing classes (used in JS but not in stylesheet)
    const stylesheetClasses = new Set(this.results.globalStylesheetClasses);
    this.results.analysis.missing = [...usedClasses].filter(
      (cls) => !stylesheetClasses.has(cls) && this.isLikelyCSSClass(cls),
    );

    // Find duplicate class assignments
    const classUsage = new Map();
    this.results.classAssignments.forEach((assignment) => {
      const key = assignment.className;
      if (!classUsage.has(key)) {
        classUsage.set(key, []);
      }
      classUsage.get(key).push(assignment);
    });

    this.results.analysis.duplicates = Array.from(classUsage.entries())
      .filter(([, assignments]) => assignments.length > 1)
      .map(([className, assignments]) => ({ className, assignments }));

    // Pattern analysis
    this.analyzePatterns();

    console.log("  ✅ Analysis complete");
  }

  analyzePatterns() {
    // Analyze selector patterns
    const selectorTypes = {};
    this.results.selectorPatterns.forEach((pattern) => {
      const { selector } = pattern;
      let type = "other";

      if (selector.startsWith(".")) type = "class";
      else if (selector.startsWith("#")) type = "id";
      else if (selector.includes("[")) type = "attribute";
      else if (selector.includes(" ")) type = "descendant";
      else type = "tag";

      if (!selectorTypes[type]) selectorTypes[type] = [];
      selectorTypes[type].push(pattern);
    });

    // Analyze class operation patterns
    const operationTypes = {};
    this.results.classAssignments.forEach((assignment) => {
      const { operation } = assignment;
      if (!operationTypes[operation]) operationTypes[operation] = [];
      operationTypes[operation].push(assignment);
    });

    this.results.analysis.patterns = {
      selectorTypes,
      operationTypes,

      // Performance insights
      querySelectorCount: this.results.selectorPatterns.length,
      classListOperations: this.results.classAssignments.filter(
        (a) => a.operation !== "assign",
      ).length,
      directClassAssignments: this.results.classAssignments.filter(
        (a) => a.operation === "assign",
      ).length,
    };
  }

  generateReport() {
    console.log("\n📋 COMPREHENSIVE CSS SELECTOR ANALYSIS REPORT");
    console.log("=".repeat(60));

    // 1. Stylesheet Classes
    console.log("\n1️⃣ CSS CLASSES IN GLOBAL STYLESHEET:");
    console.log(`   Total: ${this.results.globalStylesheetClasses.length}`);
    this.results.globalStylesheetClasses.forEach((cls) => {
      const isUsed =
        this.results.jsUsedClasses.includes(cls) ||
        this.results.classAssignments.some((ca) => ca.className === cls);
      console.log(`   • ${cls} ${isUsed ? "✅" : "❌"}`);
    });

    // 2. JavaScript Used Classes
    console.log("\n2️⃣ CSS CLASSES USED IN JAVASCRIPT:");
    console.log(`   Total: ${this.results.jsUsedClasses.length}`);
    this.results.jsUsedClasses.forEach((cls) => {
      const inStylesheet = this.results.globalStylesheetClasses.includes(cls);
      console.log(`   • ${cls} ${inStylesheet ? "✅" : "⚠️"}`);
    });

    // 3. Selector Patterns
    console.log("\n3️⃣ QUERYSELECTOR PATTERNS:");
    console.log(`   Total: ${this.results.selectorPatterns.length}`);
    this.results.selectorPatterns.forEach((pattern) => {
      console.log(
        `   • ${pattern.method}("${pattern.selector}") - Line ${pattern.line}`,
      );
    });

    // 4. Class Assignments
    console.log("\n4️⃣ CLASS ASSIGNMENTS:");
    console.log(`   Total: ${this.results.classAssignments.length}`);
    const groupedAssignments = {};
    this.results.classAssignments.forEach((assignment) => {
      const key = assignment.operation;
      if (!groupedAssignments[key]) groupedAssignments[key] = [];
      groupedAssignments[key].push(assignment);
    });

    Object.entries(groupedAssignments).forEach(([operation, assignments]) => {
      console.log(
        `   ${operation.toUpperCase()}: ${assignments.length} occurrences`,
      );
      assignments.forEach((a) => {
        console.log(`     • ${a.className} - Line ${a.line}`);
      });
    });

    // 5. Dynamic Classes
    console.log("\n5️⃣ DYNAMIC CLASS PATTERNS:");
    console.log(`   Total: ${this.results.dynamicClasses.length}`);
    this.results.dynamicClasses.forEach((dynamic) => {
      console.log(`   • ${dynamic.pattern} - Line ${dynamic.line}`);
    });

    // 6. Analysis Results
    console.log("\n6️⃣ ANALYSIS RESULTS:");

    console.log("\n   🚨 UNUSED CLASSES IN STYLESHEET:");
    if (this.results.analysis.unused.length === 0) {
      console.log("   ✅ No unused classes found");
    } else {
      this.results.analysis.unused.forEach((cls) => {
        console.log(`   • ${cls}`);
      });
    }

    console.log("\n   ⚠️ MISSING CLASSES (Used in JS but not in stylesheet):");
    if (this.results.analysis.missing.length === 0) {
      console.log("   ✅ No missing classes found");
    } else {
      this.results.analysis.missing.forEach((cls) => {
        console.log(`   • ${cls}`);
      });
    }

    console.log("\n   🔄 DUPLICATE CLASS ASSIGNMENTS:");
    if (this.results.analysis.duplicates.length === 0) {
      console.log("   ✅ No duplicate assignments found");
    } else {
      this.results.analysis.duplicates.forEach((dup) => {
        console.log(
          `   • ${dup.className}: ${dup.assignments.length} assignments`,
        );
        dup.assignments.forEach((a) => {
          console.log(`     - ${a.operation} at line ${a.line}`);
        });
      });
    }

    // 7. Performance Insights
    console.log("\n7️⃣ PERFORMANCE INSIGHTS:");
    const { patterns } = this.results.analysis;
    console.log(
      `   • Total querySelector calls: ${patterns.querySelectorCount}`,
    );
    console.log(`   • classList operations: ${patterns.classListOperations}`);
    console.log(
      `   • Direct className assignments: ${patterns.directClassAssignments}`,
    );

    if (patterns.querySelectorCount > 10) {
      console.log(
        "   ⚠️ High number of querySelector calls - consider element caching",
      );
    }

    if (patterns.directClassAssignments > 5) {
      console.log(
        "   ⚠️ Multiple direct className assignments - consider classList methods",
      );
    }

    // 8. Recommendations
    console.log("\n8️⃣ RECOMMENDATIONS:");
    if (this.results.analysis.unused.length > 0) {
      console.log("   • Remove unused CSS classes to reduce bundle size");
    }
    if (this.results.analysis.missing.length > 0) {
      console.log("   • Add missing CSS classes to the global stylesheet");
    }
    if (patterns.querySelectorCount > 5) {
      console.log("   • Implement element caching to reduce DOM queries");
    }
    console.log("   • Consider using CSS-in-JS for dynamic styling");
    console.log("   • Use semantic class names following BEM methodology");

    console.log("\n✅ Analysis complete!\n");

    // Save detailed results
    this.saveResults();
  }

  saveResults() {
    const reportData = {
      timestamp: new Date().toISOString(),
      file: UI_FILE_PATH,
      results: this.results,
      summary: {
        totalStylesheetClasses: this.results.globalStylesheetClasses.length,
        totalJSUsedClasses: this.results.jsUsedClasses.length,
        totalSelectorPatterns: this.results.selectorPatterns.length,
        totalClassAssignments: this.results.classAssignments.length,
        totalDynamicClasses: this.results.dynamicClasses.length,
        unusedClasses: this.results.analysis.unused.length,
        missingClasses: this.results.analysis.missing.length,
        duplicateAssignments: this.results.analysis.duplicates.length,
      },
    };

    const outputFile = "css-selector-analysis-results.json";
    fs.writeFileSync(outputFile, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed results saved to: ${outputFile}`);
  }

  isLikelyCSSClass(str) {
    // Heuristics to determine if a string is likely a CSS class name
    if (str.length < 2) return false;
    if (str.includes(".") && !str.startsWith(".")) return false; // File extensions
    if (str.includes("/")) return false; // File paths
    if (str.includes("http")) return false; // URLs
    if (/^[A-Z_]+$/.test(str)) return false; // Constants
    if (/^\d+$/.test(str)) return false; // Numbers
    if (str.includes(" ") && str.split(" ").length > 3) return false; // Long sentences

    // Common CSS class patterns
    return (
      /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(str) &&
      (str.includes("-") || str.includes("_") || str.length < 20)
    );
  }

  findLineNumber(content, searchString) {
    const lines = content
      .substring(0, content.indexOf(searchString))
      .split("\n");
    return lines.length;
  }
}

// Run the analysis
const analyzer = new CSSAnalyzer();
analyzer.analyzeFile();
