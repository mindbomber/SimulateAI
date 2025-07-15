/**
 * Migration Script for Shared Navigation
 * Helps convert existing pages to use the shared navigation component
 */

class NavigationMigration {
  constructor() {
    this.backupSuffix = '.nav-backup';
    this.filesToMigrate = [
      'index.html',
      'categories.html',
      'blog.html',
      'forum.html',
      'profile.html',
      'privacy-notice.html',
      'donate.html',
    ];
  }

  /**
   * Migrate a page to use shared navigation
   * @param {string} pageContent - The HTML content of the page
   * @param {string} pageId - The page identifier
   * @returns {string} The migrated HTML content
   */
  migratePage(pageContent, pageId) {
    let migratedContent = pageContent;

    // 1. Add page-id meta tag if not present
    migratedContent = this.addPageIdMeta(migratedContent, pageId);

    // 2. Add shared navigation CSS link if not present
    migratedContent = this.addNavigationCSS(migratedContent);

    // 3. Remove existing header/navigation
    migratedContent = this.removeExistingNavigation(migratedContent);

    // 4. Add navigation script inclusion
    migratedContent = this.addNavigationScript(migratedContent);

    return migratedContent;
  }

  /**
   * Add page-id meta tag
   */
  addPageIdMeta(content, pageId) {
    // Check if page-id meta tag already exists
    if (content.includes('name="page-id"')) {
      return content;
    }

    // Add after charset meta tag
    const metaCharsetRegex = /<meta\s+charset="[^"]*"\s*>/i;
    const match = content.match(metaCharsetRegex);

    if (match) {
      const insertionPoint = match.index + match[0].length;
      const pageIdMeta = `\n    <meta name="page-id" content="${pageId}">`;
      return (
        content.slice(0, insertionPoint) +
        pageIdMeta +
        content.slice(insertionPoint)
      );
    }

    // Fallback: add in head section
    const headMatch = content.match(/<head[^>]*>/i);
    if (headMatch) {
      const insertionPoint = headMatch.index + headMatch[0].length;
      const pageIdMeta = `\n    <meta name="page-id" content="${pageId}">`;
      return (
        content.slice(0, insertionPoint) +
        pageIdMeta +
        content.slice(insertionPoint)
      );
    }

    return content;
  }

  /**
   * Add shared navigation CSS link
   */
  addNavigationCSS(content) {
    // Check if already included
    if (content.includes('shared-navigation.css')) {
      return content;
    }

    // Find last stylesheet link or add after title
    const stylesheetRegex = /<link[^>]*rel="stylesheet"[^>]*>/gi;
    const matches = [...content.matchAll(stylesheetRegex)];

    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const insertionPoint = lastMatch.index + lastMatch[0].length;
      const navCSS = `\n    <link rel="stylesheet" href="src/styles/shared-navigation.css">`;
      return (
        content.slice(0, insertionPoint) +
        navCSS +
        content.slice(insertionPoint)
      );
    }

    // Fallback: add after title
    const titleMatch = content.match(/<title[^>]*>.*?<\/title>/i);
    if (titleMatch) {
      const insertionPoint = titleMatch.index + titleMatch[0].length;
      const navCSS = `\n    <link rel="stylesheet" href="src/styles/shared-navigation.css">`;
      return (
        content.slice(0, insertionPoint) +
        navCSS +
        content.slice(insertionPoint)
      );
    }

    return content;
  }

  /**
   * Remove existing navigation/header
   */
  removeExistingNavigation(content) {
    // Remove existing header with navigation
    const headerRegex = /<header\s+class="header"[^>]*>.*?<\/header>/gis;
    let result = content.replace(
      headerRegex,
      '<!-- Navigation will be injected here by SharedNavigation -->'
    );

    // Also remove any standalone nav elements
    const navRegex = /<nav[^>]*class="[^"]*main-nav[^"]*"[^>]*>.*?<\/nav>/gis;
    result = result.replace(navRegex, '');

    return result;
  }

  /**
   * Add navigation script inclusion
   */
  addNavigationScript(content) {
    // Check if already included
    if (content.includes('shared-navigation.js')) {
      return content;
    }

    // Add before closing body tag
    const bodyEndRegex = /<\/body>/i;
    const match = content.match(bodyEndRegex);

    if (match) {
      const insertionPoint = match.index;
      const navScript = `    <!-- Include shared navigation component -->\n    <script type="module" src="src/js/components/shared-navigation.js"></script>\n\n`;
      return (
        content.slice(0, insertionPoint) +
        navScript +
        content.slice(insertionPoint)
      );
    }

    return content;
  }

  /**
   * Generate migration instructions
   */
  generateMigrationInstructions() {
    return `
# Shared Navigation Migration Guide

## Automatic Migration
Run the migration script to automatically update your pages:

\`\`\`javascript
const migration = new NavigationMigration();
// Apply to each page...
\`\`\`

## Manual Migration Steps

### 1. Add Page Identifier
Add a meta tag to identify the current page:
\`\`\`html
<meta name="page-id" content="home">
\`\`\`

Page IDs: home, categories, blog, forum, profile, privacy, donate

### 2. Include Shared Navigation CSS
Add the stylesheet link in your head section:
\`\`\`html
<link rel="stylesheet" href="src/styles/shared-navigation.css">
\`\`\`

### 3. Remove Existing Navigation
Remove your existing header/navigation HTML. Replace with:
\`\`\`html
<!-- Navigation will be injected here by SharedNavigation -->
\`\`\`

### 4. Include Navigation Script
Add before closing body tag:
\`\`\`html
<script type="module" src="src/js/components/shared-navigation.js"></script>
\`\`\`

### 5. Update Your CSS (Optional)
If you have navigation-specific styles, you may need to update them or remove them since the shared navigation has its own styling.

### 6. Test Navigation
- Test mobile hamburger menu
- Test mega menu functionality
- Test dropdown menus
- Verify active page highlighting
- Test keyboard navigation
- Verify accessibility features

## Integration with Existing Apps

If you have existing JavaScript that interacts with navigation:

\`\`\`javascript
// Wait for shared navigation to load
document.addEventListener('DOMContentLoaded', () => {
    if (window.sharedNav) {
        // Navigation is ready
        // Set up your app-specific navigation handlers
        
        // Example: Connect to your app instance
        if (window.app) {
            window.app.sharedNav = window.sharedNav;
        }
    }
});
\`\`\`

## Benefits of Migration

1. **Consistency**: Same navigation across all pages
2. **Maintainability**: Update navigation in one place
3. **Performance**: Cached navigation component
4. **Accessibility**: Built-in accessibility features
5. **Mobile-First**: Responsive design included
6. **Organization**: Cleaner navigation grouping
7. **Extensibility**: Easy to add new navigation features

## Troubleshooting

### Navigation not loading
- Check that the shared-navigation.js path is correct
- Verify the shared-navigation.html file exists
- Check browser console for errors

### Active page not highlighted
- Verify the page-id meta tag is correct
- Check that the navigation HTML includes data-page attributes

### Mobile menu not working
- Ensure shared-navigation.css is loaded
- Check for JavaScript errors
- Verify the navigation HTML structure

### Mega menu not displaying
- Check CSS z-index conflicts
- Verify the mega menu HTML structure
- Test in different browsers
        `;
  }

  /**
   * Check if a page needs migration
   */
  needsMigration(content) {
    const hasPageId = content.includes('name="page-id"');
    const hasSharedCSS = content.includes('shared-navigation.css');
    const hasSharedJS = content.includes('shared-navigation.js');
    const hasOldNav =
      content.includes('class="header"') || content.includes('main-nav');

    return !hasPageId || !hasSharedCSS || !hasSharedJS || hasOldNav;
  }

  /**
   * Extract page ID from filename
   */
  getPageIdFromFilename(filename) {
    const pageMap = {
      'index.html': 'home',
      'categories.html': 'categories',
      'blog.html': 'blog',
      'forum.html': 'forum',
      'profile.html': 'profile',
      'privacy-notice.html': 'privacy',
      'donate.html': 'donate',
    };

    return pageMap[filename] || 'home';
  }
}

// Usage Example:
// const migration = new NavigationMigration();
// const pageContent = '...'; // load your HTML content
// const migratedContent = migration.migratePage(pageContent, 'home');

export default NavigationMigration;
