# Shared Navigation Component

A JavaScript-powered shared navigation system that organizes navigation into logical groups for
better user experience and maintainability.

## Overview

The Shared Navigation Component solves the navigation clutter problem by:

1. **Organizing navigation into logical groups**: Primary, Community, Actions, and Authentication
2. **Providing a single source of truth**: Navigation defined once in `shared-navigation.html`
3. **Enabling easy maintenance**: Update navigation in one place, applies to all pages
4. **Improving mobile experience**: Better organization and responsive design
5. **Enhancing accessibility**: Built-in keyboard navigation and ARIA support

## Navigation Organization

### Primary Navigation Group

- **Home**: Main landing page
- **Categories**: AI Ethics categories with mega menu
- **Ethics Guide**: Educational content
- **Educator Tools**: Resources for educators

### Community Navigation Group

- **Community Dropdown**:
  - Blog: Latest articles and insights
  - Forum: Community discussions
  - Profile: User profile and settings

### About Navigation Group

- **About Dropdown**:
  - About SimulateAI: Platform information
  - Privacy Notice: Privacy policy and data handling

### Action Buttons Group

- **Take Tour**: Interactive onboarding
- **Surprise Me!**: Random scenario launcher
- **Donate**: Support the platform

### Authentication Group

- **Sign In/Out**: User authentication
- **Link Accounts**: Connect multiple sign-in methods
- **User Profile**: Welcome message and quick actions

## File Structure

```
src/
├── components/
│   └── shared-navigation.html          # Navigation HTML template
├── js/
│   ├── components/
│   │   └── shared-navigation.js        # Navigation component logic
│   └── utils/
│       └── navigation-migration.js     # Migration helper
└── styles/
    └── shared-navigation.css           # Navigation styles
```

## Quick Start

### 1. Include in New Pages

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Page - SimulateAI</title>

    <!-- Page identifier for active state -->
    <meta name="page-id" content="your-page-id" />

    <!-- Include navigation styles -->
    <link rel="stylesheet" href="src/styles/shared-navigation.css" />
  </head>
  <body>
    <!-- Navigation will be injected here -->

    <main>
      <!-- Your page content -->
    </main>

    <!-- Include navigation component -->
    <script type="module" src="src/js/components/shared-navigation.js"></script>
  </body>
</html>
```

### 2. Page Identifiers

Use these page IDs in the meta tag:

- `home` - app.html
- `categories` - categories.html
- `blog` - blog.html
- `forum` - forum.html
- `profile` - profile.html
- `privacy` - privacy-notice.html
- `donate` - donate.html
- `about` - about page sections
- `educator-tools` - educator resources
- `ethics-guide` - ethics guide sections

### 3. Integration with Existing Apps

```javascript
// Wait for navigation to initialize
document.addEventListener('DOMContentLoaded', () => {
  if (window.sharedNav) {
    // Connect to your app
    if (window.app) {
      window.app.sharedNav = window.sharedNav;
    }

    // Custom navigation event handlers
    window.sharedNav.on('categorySelected', category => {
      // Handle category selection
    });
  }
});
```

## Features

### Mega Menu

- **Categories overview**: Visual grid of AI ethics categories
- **Search functionality**: Filter categories by name or description
- **Keyboard navigation**: Full accessibility support
- **Responsive design**: Adapts to mobile screens

### Dropdown Menus

- **Community menu**: Blog, Forum, Profile access
- **About menu**: Platform info and privacy
- **Smooth animations**: CSS transitions with reduced motion support
- **Click outside to close**: Intuitive interaction

### Mobile Navigation

- **Hamburger menu**: Space-efficient mobile interface
- **Full-screen overlay**: Easy navigation on small screens
- **Touch-friendly**: Large tap targets
- **Backdrop close**: Tap outside to close

### Accessibility

- **Keyboard navigation**: Tab, Enter, Space, Arrow keys
- **Screen reader support**: Proper ARIA labels and roles
- **High contrast mode**: Automatic adaptation
- **Reduced motion**: Respects user preferences
- **Focus management**: Proper focus trapping and restoration

## API Reference

### SharedNavigation Class

#### Methods

```javascript
// Initialize navigation
await sharedNav.init(options);

// Set active page
sharedNav.setActivePage(pageId);

// Update user display
sharedNav.updateUserDisplay(user);

// Manual control
sharedNav.openMegaMenu();
sharedNav.closeMegaMenu();
sharedNav.toggleMobileNav();
```

#### Options

```javascript
{
    currentPage: 'home',                           // Page identifier
    navPath: 'src/components/shared-navigation.html' // Custom nav file path
}
```

#### Events

The component integrates with existing app functionality:

```javascript
// Category selection (mega menu)
window.app.handleCategorySelection(category);

// Tour functionality
window.app.startOnboardingTour();

// Random scenario
window.app.launchRandomScenario();

// Authentication
window.app.authService.signIn();
window.app.authService.signOut();
window.app.authService.linkAccounts();
```

## Customization

### Adding New Navigation Items

1. **Edit shared-navigation.html**:

```html
<li><a href="new-page.html" class="nav-link" data-page="new-page">New Item</a></li>
```

2. **Update page identifier mapping** in `shared-navigation.js`:

```javascript
const pageMap = {
  'new-page.html': 'new-page',
  // ... existing mappings
};
```

3. **Add styles** in `shared-navigation.css` if needed.

### Modifying Navigation Groups

Edit the HTML structure in `shared-navigation.html`:

```html
<!-- Add to existing group -->
<div class="nav-group nav-group-primary">
  <ul class="nav-list">
    <!-- Add your item here -->
  </ul>
</div>

<!-- Create new group -->
<div class="nav-group nav-group-custom">
  <ul class="nav-list">
    <!-- Your custom navigation items -->
  </ul>
</div>
```

### Styling Navigation Groups

```css
/* Style your custom group */
.nav-group-custom {
  /* Your styles */
}

.nav-group-custom .nav-link {
  /* Custom link styles */
}
```

## Mobile Responsive Design

The navigation automatically adapts to different screen sizes:

### Desktop (768px+)

- Full horizontal navigation with all groups visible
- Mega menu and dropdowns
- Hover effects and transitions

### Mobile (< 768px)

- Community and Actions groups hidden
- About navigation remains visible for essential links
- Essential navigation preserved

### Small Mobile (< 480px)

- Hamburger menu with full-screen overlay
- Vertical navigation layout
- All groups accessible in mobile menu
- Touch-friendly interactions

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **IE11**: Basic functionality with polyfills
- **Mobile browsers**: iOS Safari 14+, Chrome Mobile 90+

## Performance

- **Lazy loading**: Navigation HTML loaded on demand
- **Caching**: Navigation template cached after first load
- **Minimal JavaScript**: Lightweight component (~15KB)
- **CSS optimization**: Efficient selectors and minimal reflows
- **Preload hints**: Optional preloading for critical resources

## Troubleshooting

### Common Issues

1. **Navigation not appearing**
   - Check file paths in script src
   - Verify shared-navigation.html exists
   - Check browser console for errors

2. **Active page not highlighted**
   - Verify page-id meta tag
   - Check data-page attributes in navigation HTML
   - Ensure page ID matches the mapping

3. **Mobile menu not working**
   - Check CSS file is loaded
   - Verify JavaScript module loading
   - Test in different browsers

4. **Mega menu not showing**
   - Check CSS z-index conflicts
   - Verify HTML structure
   - Test with browser developer tools

5. **Dropdowns appearing empty**
   - Check screen width - Community dropdown hidden on small screens (< 768px)
   - About dropdown should always be visible
   - Verify dropdown HTML structure in shared-navigation.html
   - Test dropdown functionality with browser developer tools

6. **Integration issues**
   - Ensure app instance is available globally
   - Check method names match your app's API
   - Add error handling for missing methods

### Debug Mode

Enable debugging in development:

```javascript
// In browser console
window.sharedNav.debug = true;
```

This will log navigation events and state changes.

## Migration Guide

See `navigation-migration.js` for automated migration of existing pages.

### Manual Migration Steps

1. Add page-id meta tag
2. Include shared-navigation.css
3. Remove existing navigation HTML
4. Include shared-navigation.js
5. Test all navigation functionality
6. Update app integration if needed

## Best Practices

1. **Consistent page IDs**: Use the standard page ID mapping
2. **Progressive enhancement**: Ensure basic navigation works without JavaScript
3. **Test accessibility**: Use keyboard and screen readers
4. **Performance monitoring**: Monitor navigation load times
5. **Mobile testing**: Test on actual mobile devices
6. **User feedback**: Gather feedback on navigation usability

## Future Enhancements

Planned improvements:

- **Search functionality**: Global search in navigation
- **Breadcrumbs**: Automatic breadcrumb generation
- **Theme support**: Dark mode and custom themes
- **Analytics integration**: Navigation usage tracking
- **Personalization**: User-customizable navigation
- **Progressive Web App**: Offline navigation support

## Contributing

To contribute to the shared navigation:

1. Follow the existing code style
2. Add comprehensive tests
3. Update documentation
4. Test accessibility
5. Verify mobile responsiveness
6. Test with existing app integration
