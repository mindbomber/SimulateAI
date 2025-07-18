/**
 * Dead Code and Unused Files Analyzer
 * Analyzes JavaScript files to identify:
 * - Files with no imports (potential unused files)
 * - Files that export but are never imported
 * - Unused imports within files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeadCodeAnalyzer {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.jsFiles = [];
    this.htmlFiles = [];
    this.imports = new Map(); // file -> [imported files]
    this.exports = new Map(); // file -> [exported items]
    this.fileImportees = new Map(); // file -> [files that import it]
    this.scriptTags = new Set(); // files referenced in script tags
  }

  async analyze() {
    console.log('🔍 Starting Dead Code Analysis...\n');

    // 1. Scan all files
    await this.scanFiles();

    // 2. Parse JavaScript files
    await this.parseJavaScriptFiles();

    // 3. Parse HTML files for script references
    await this.parseHtmlFiles();

    // 4. Build dependency graph
    this.buildDependencyGraph();

    // 5. Generate reports
    this.generateReports();
  }

  async scanFiles() {
    const scanDir = dir => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (ext === '.js') {
            this.jsFiles.push(fullPath);
          } else if (ext === '.html') {
            this.htmlFiles.push(fullPath);
          }
        }
      }
    };

    scanDir(this.rootDir);
    console.log(`📁 Found ${this.jsFiles.length} JavaScript files`);
    console.log(`📄 Found ${this.htmlFiles.length} HTML files`);
  }

  async parseJavaScriptFiles() {
    console.log('🔍 Parsing JavaScript files...');

    for (const filePath of this.jsFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(this.rootDir, filePath);

        // Extract imports
        const imports = this.extractImports(content, filePath);
        this.imports.set(relativePath, imports);

        // Extract exports
        const exports = this.extractExports(content);
        this.exports.set(relativePath, exports);
      } catch (error) {
        console.warn(`⚠️  Could not parse ${filePath}: ${error.message}`);
      }
    }
  }

  async parseHtmlFiles() {
    console.log('🔍 Parsing HTML files for script references...');

    for (const filePath of this.htmlFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Find script tags
        const scriptMatches = content.match(
          /<script[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi
        );
        if (scriptMatches) {
          for (const match of scriptMatches) {
            const srcMatch = match.match(/src\s*=\s*["']([^"']+)["']/i);
            if (srcMatch) {
              const scriptSrc = srcMatch[1];
              // Normalize path
              const normalizedPath = this.normalizePath(scriptSrc, filePath);
              if (normalizedPath) {
                this.scriptTags.add(normalizedPath);
              }
            }
          }
        }

        // Find module imports in script tags
        const moduleMatches = content.match(
          /<script[^>]*type\s*=\s*["']module["'][^>]*>([\s\S]*?)<\/script>/gi
        );
        if (moduleMatches) {
          for (const match of moduleMatches) {
            const scriptContent = match.replace(
              /<script[^>]*>|<\/script>/gi,
              ''
            );
            const imports = this.extractImports(scriptContent, filePath);
            // Add these to a special HTML file entry
            const htmlRelativePath = path.relative(this.rootDir, filePath);
            this.imports.set(htmlRelativePath, imports);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Could not parse HTML ${filePath}: ${error.message}`);
      }
    }
  }

  extractImports(content, filePath) {
    const imports = [];

    // ES6 imports
    const importMatches = content.match(
      /import\s+(?:[^'"]*from\s+)?['"`]([^'"`]+)['"`]/g
    );
    if (importMatches) {
      for (const match of importMatches) {
        const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (pathMatch) {
          const importPath = pathMatch[1];
          const resolvedPath = this.resolveImportPath(importPath, filePath);
          if (resolvedPath) {
            imports.push({
              type: 'import',
              path: importPath,
              resolved: resolvedPath,
              line: this.getLineNumber(content, match),
            });
          }
        }
      }
    }

    // Dynamic imports
    const dynamicImports = content.match(
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    );
    if (dynamicImports) {
      for (const match of dynamicImports) {
        const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (pathMatch) {
          const importPath = pathMatch[1];
          const resolvedPath = this.resolveImportPath(importPath, filePath);
          if (resolvedPath) {
            imports.push({
              type: 'dynamic',
              path: importPath,
              resolved: resolvedPath,
              line: this.getLineNumber(content, match),
            });
          }
        }
      }
    }

    // CommonJS requires
    const requireMatches = content.match(
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
    );
    if (requireMatches) {
      for (const match of requireMatches) {
        const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (pathMatch) {
          const importPath = pathMatch[1];
          const resolvedPath = this.resolveImportPath(importPath, filePath);
          if (resolvedPath) {
            imports.push({
              type: 'require',
              path: importPath,
              resolved: resolvedPath,
              line: this.getLineNumber(content, match),
            });
          }
        }
      }
    }

    return imports;
  }

  extractExports(content) {
    const exports = [];

    // Named exports
    const namedExports = content.match(/export\s+\{[^}]*\}/g);
    if (namedExports) {
      exports.push(
        ...namedExports.map(exp => ({
          type: 'named',
          content: exp.trim(),
          line: this.getLineNumber(content, exp),
        }))
      );
    }

    // Export declarations
    const exportDeclarations = content.match(
      /export\s+(class|function|const|let|var)\s+\w+/g
    );
    if (exportDeclarations) {
      exports.push(
        ...exportDeclarations.map(exp => ({
          type: 'declaration',
          content: exp.trim(),
          line: this.getLineNumber(content, exp),
        }))
      );
    }

    // Default exports
    const defaultExports = content.match(/export\s+default\s+[\w\s{]/g);
    if (defaultExports) {
      exports.push(
        ...defaultExports.map(exp => ({
          type: 'default',
          content: exp.trim(),
          line: this.getLineNumber(content, exp),
        }))
      );
    }

    return exports;
  }

  resolveImportPath(importPath, fromFile) {
    // Skip external modules
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      return null;
    }

    const fromDir = path.dirname(fromFile);
    let resolvedPath;

    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      resolvedPath = path.resolve(fromDir, importPath);
    } else if (importPath.startsWith('/')) {
      resolvedPath = path.resolve(this.rootDir, importPath.substring(1));
    } else {
      return null;
    }

    // Add .js extension if missing
    if (!path.extname(resolvedPath)) {
      resolvedPath += '.js';
    }

    // Check if file exists
    if (fs.existsSync(resolvedPath)) {
      return path.relative(this.rootDir, resolvedPath);
    }

    return null;
  }

  normalizePath(scriptSrc, htmlFile) {
    // Skip external URLs
    if (scriptSrc.startsWith('http') || scriptSrc.startsWith('//')) {
      return null;
    }

    const htmlDir = path.dirname(htmlFile);
    let resolvedPath;

    if (scriptSrc.startsWith('./') || scriptSrc.startsWith('../')) {
      resolvedPath = path.resolve(htmlDir, scriptSrc);
    } else if (scriptSrc.startsWith('/')) {
      resolvedPath = path.resolve(this.rootDir, scriptSrc.substring(1));
    } else {
      resolvedPath = path.resolve(htmlDir, scriptSrc);
    }

    if (fs.existsSync(resolvedPath)) {
      return path.relative(this.rootDir, resolvedPath);
    }

    return null;
  }

  getLineNumber(content, searchText) {
    const index = content.indexOf(searchText);
    if (index === -1) return 1;
    return content.substring(0, index).split('\n').length;
  }

  buildDependencyGraph() {
    console.log('🔗 Building dependency graph...');

    // Build reverse lookup of which files import each file
    for (const [file, imports] of this.imports) {
      for (const imp of imports) {
        if (imp.resolved) {
          if (!this.fileImportees.has(imp.resolved)) {
            this.fileImportees.set(imp.resolved, []);
          }
          this.fileImportees.get(imp.resolved).push(file);
        }
      }
    }
  }

  generateReports() {
    console.log('\n📊 ANALYSIS RESULTS\n');
    console.log('='.repeat(80));

    this.reportFilesWithNoImports();
    this.reportUnusedFiles();
    this.reportFilesWithNoExports();
    this.reportLargeFiles();
    this.reportBackupFiles();
    this.reportSummary();
  }

  reportFilesWithNoImports() {
    console.log(
      '\n🚨 FILES WITH NO IMPORTS (Potential Entry Points or Unused Files):'
    );
    console.log('-'.repeat(80));

    const filesWithNoImports = [];

    for (const file of this.jsFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const imports = this.imports.get(relativePath) || [];

      if (imports.length === 0) {
        const stats = fs.statSync(file);
        filesWithNoImports.push({
          path: relativePath,
          size: stats.size,
          modified: stats.mtime,
        });
      }
    }

    // Sort by size (largest first)
    filesWithNoImports.sort((a, b) => b.size - a.size);

    if (filesWithNoImports.length === 0) {
      console.log('✅ All JavaScript files have imports.');
    } else {
      for (const file of filesWithNoImports) {
        const sizeKB = (file.size / 1024).toFixed(1);
        const isEntry = this.scriptTags.has(file.path);
        const marker = isEntry ? '🎯 [ENTRY]' : '❓ [CHECK]';
        console.log(`${marker} ${file.path} (${sizeKB} KB)`);
      }
    }
  }

  reportUnusedFiles() {
    console.log('\n🗑️  POTENTIALLY UNUSED FILES (Never Imported):');
    console.log('-'.repeat(80));

    const unusedFiles = [];

    for (const file of this.jsFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const isImported = this.fileImportees.has(relativePath);
      const isInScriptTag = this.scriptTags.has(relativePath);
      const exports = this.exports.get(relativePath) || [];

      if (!isImported && !isInScriptTag && exports.length > 0) {
        const stats = fs.statSync(file);
        unusedFiles.push({
          path: relativePath,
          size: stats.size,
          exports: exports.length,
          modified: stats.mtime,
        });
      }
    }

    // Sort by size (largest first)
    unusedFiles.sort((a, b) => b.size - a.size);

    if (unusedFiles.length === 0) {
      console.log('✅ No obviously unused files found.');
    } else {
      for (const file of unusedFiles) {
        const sizeKB = (file.size / 1024).toFixed(1);
        console.log(`🗑️  ${file.path} (${sizeKB} KB, ${file.exports} exports)`);
      }
    }
  }

  reportFilesWithNoExports() {
    console.log('\n📤 FILES WITH NO EXPORTS (Side-effect only or Unused):');
    console.log('-'.repeat(80));

    const filesWithNoExports = [];

    for (const file of this.jsFiles) {
      const relativePath = path.relative(this.rootDir, file);
      const exports = this.exports.get(relativePath) || [];

      if (exports.length === 0) {
        const stats = fs.statSync(file);
        const isImported = this.fileImportees.has(relativePath);
        const isInScriptTag = this.scriptTags.has(relativePath);

        filesWithNoExports.push({
          path: relativePath,
          size: stats.size,
          isImported,
          isInScriptTag,
          modified: stats.mtime,
        });
      }
    }

    // Sort by size (largest first)
    filesWithNoExports.sort((a, b) => b.size - a.size);

    if (filesWithNoExports.length === 0) {
      console.log('✅ All JavaScript files have exports.');
    } else {
      for (const file of filesWithNoExports) {
        const sizeKB = (file.size / 1024).toFixed(1);
        const usage = file.isImported
          ? '📥 [IMPORTED]'
          : file.isInScriptTag
            ? '🎯 [SCRIPT]'
            : '❓ [CHECK]';
        console.log(`${usage} ${file.path} (${sizeKB} KB)`);
      }
    }
  }

  reportLargeFiles() {
    console.log('\n📏 LARGE FILES (>100KB):');
    console.log('-'.repeat(80));

    const largeFiles = [];

    for (const file of this.jsFiles) {
      const stats = fs.statSync(file);
      if (stats.size > 100 * 1024) {
        // > 100KB
        const relativePath = path.relative(this.rootDir, file);
        largeFiles.push({
          path: relativePath,
          size: stats.size,
          modified: stats.mtime,
        });
      }
    }

    // Sort by size (largest first)
    largeFiles.sort((a, b) => b.size - a.size);

    if (largeFiles.length === 0) {
      console.log('✅ No files larger than 100KB.');
    } else {
      for (const file of largeFiles) {
        const sizeKB = (file.size / 1024).toFixed(1);
        console.log(`📏 ${file.path} (${sizeKB} KB)`);
      }
    }
  }

  reportBackupFiles() {
    console.log('\n🔄 BACKUP AND TEMPORARY FILES:');
    console.log('-'.repeat(80));

    const backupFiles = this.jsFiles.filter(file => {
      const relativePath = path.relative(this.rootDir, file);
      return (
        relativePath.includes('.backup') ||
        relativePath.includes('.temp') ||
        relativePath.includes('.old') ||
        relativePath.includes('cleanup-backup')
      );
    });

    if (backupFiles.length === 0) {
      console.log('✅ No backup files found.');
    } else {
      for (const file of backupFiles) {
        const relativePath = path.relative(this.rootDir, file);
        const stats = fs.statSync(file);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`🔄 ${relativePath} (${sizeKB} KB)`);
      }
    }
  }

  reportSummary() {
    console.log('\n📋 SUMMARY:');
    console.log('-'.repeat(80));

    const totalFiles = this.jsFiles.length;
    const filesWithImports = [...this.imports.values()].filter(
      imports => imports.length > 0
    ).length;
    const filesWithExports = [...this.exports.values()].filter(
      exports => exports.length > 0
    ).length;
    const referencedFiles = new Set([
      ...this.fileImportees.keys(),
      ...this.scriptTags,
    ]).size;

    console.log(`📁 Total JavaScript files: ${totalFiles}`);
    console.log(`📥 Files with imports: ${filesWithImports}`);
    console.log(`📤 Files with exports: ${filesWithExports}`);
    console.log(`🔗 Referenced files: ${referencedFiles}`);

    const potentialUnused = totalFiles - referencedFiles;
    console.log(`❓ Potentially unused: ${potentialUnused}`);

    // Calculate total size
    const totalSize = this.jsFiles.reduce((sum, file) => {
      return sum + fs.statSync(file).size;
    }, 0);
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`💾 Total size: ${totalSizeMB} MB`);
  }
}

// Run the analyzer
const analyzer = new DeadCodeAnalyzer(__dirname);
analyzer.analyze().catch(console.error);
