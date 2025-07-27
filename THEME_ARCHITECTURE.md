# 🎨 SimulateAI Theme Architecture Guide

## Overview

SimulateAI uses a comprehensive, centralized theme system that ensures consistent visual design across all components while supporting multiple themes including light mode, dark mode, and high contrast accessibility modes.

## 🏗️ Architecture

### Core Files

1. **`design-tokens.css`** - Central theme token definitions
2. **`appearance-settings.css`** - Appearance-specific overrides
3. **`theme-validator.js`** - Development validation utility

### Theme Hierarchy

```
:root (design-tokens.css)
├── Core Color Palette
├── Semantic Theme Tokens
├── Component Patterns
└── Theme Overrides
    ├── body.dark-mode
    ├── body.high-contrast
    └── @media (prefers-color-scheme: dark)
```

## 🎯 Semantic Theme Tokens

### Background Colors

```css
--theme-bg-primary      /* Main background */
--theme-bg-secondary    /* Secondary sections */
--theme-bg-tertiary     /* Subtle backgrounds */
--theme-bg-interactive  /* Hover states */
--theme-bg-overlay      /* Modal backdrops */
```

### Text Colors

```css
--theme-text-primary    /* Primary text */
--theme-text-secondary  /* Secondary text */
--theme-text-tertiary   /* Subtle text */
--theme-text-muted      /* Disabled/muted */
--theme-text-inverse    /* Light text on dark */
--theme-text-on-accent  /* Text on accent colors */
```

### Border Colors

```css
--theme-border-primary     /* Default borders */
--theme-border-secondary   /* Subtle borders */
--theme-border-interactive /* Interactive elements */
--theme-border-focus       /* Focus indicators */
--theme-border-error       /* Error states */
--theme-border-success     /* Success states */
```

### Accent Colors

```css
--theme-accent-primary   /* Primary actions */
--theme-accent-secondary /* Secondary actions */
--theme-accent-success   /* Success states */
--theme-accent-warning   /* Warning states */
--theme-accent-error     /* Error states */
--theme-accent-info      /* Information states */
```

### Shadow Colors

```css
--theme-shadow-light   /* Subtle shadows */
--theme-shadow-medium  /* Standard shadows */
--theme-shadow-heavy   /* Prominent shadows */
--theme-shadow-focus   /* Focus indicators */
```

## 📐 Standardized Component Patterns

### Basic Component Pattern

```css
.component {
  background: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--duration-200) ease;
}
```

### Interactive Component Pattern

```css
.interactive {
  background: var(--theme-bg-interactive);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-interactive);
  cursor: pointer;
  transition: all var(--duration-200) ease;
}

.interactive:hover {
  opacity: var(--theme-hover-opacity);
  border-color: var(--theme-border-focus);
  box-shadow: 0 2px 8px var(--theme-shadow-medium);
}

.interactive:focus {
  outline: 2px solid var(--theme-border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--theme-shadow-focus);
}
```

### Form Component Pattern

```css
.form-input {
  background: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  transition: all var(--duration-200) ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--theme-border-focus);
  box-shadow: 0 0 0 3px var(--theme-shadow-focus);
}

.form-input:disabled {
  opacity: var(--theme-disabled-opacity);
  cursor: not-allowed;
}
```

### Modal/Dialog Pattern

```css
.modal {
  background: var(--theme-bg-overlay);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 25px var(--theme-shadow-heavy);
}
```

### Navigation Pattern

```css
.nav-item {
  background: transparent;
  color: var(--theme-text-secondary);
  border: 1px solid transparent;
  padding: var(--space-2) var(--space-4);
  transition: all var(--duration-200) ease;
}

.nav-item:hover {
  background: var(--theme-bg-interactive);
  color: var(--theme-text-primary);
}

.nav-item.active {
  background: var(--theme-bg-secondary);
  color: var(--theme-accent-primary);
  border-color: var(--theme-border-focus);
}
```

### Status Component Pattern

```css
.status-success {
  background: var(--theme-accent-success);
  color: var(--theme-text-on-accent);
}

.status-warning {
  background: var(--theme-accent-warning);
  color: var(--theme-text-on-accent);
}

.status-error {
  background: var(--theme-accent-error);
  color: var(--theme-text-on-accent);
}
```

## 🎨 Supported Themes

### Light Mode (Default)

- Clean, bright interface
- High contrast for readability
- Professional appearance

### Dark Mode

```css
body.dark-mode {
  /* Automatically inherits dark theme tokens */
}
```

### High Contrast Mode

```css
body.high-contrast,
body.theme-high-contrast {
  /* Enhanced accessibility with maximum contrast */
}
```

### System Preference Detection

```css
@media (prefers-color-scheme: dark) {
  /* Automatically applies dark mode based on system preference */
}
```

## 🔧 Implementation Guidelines

### ✅ DO

```css
/* Use semantic theme tokens */
.my-component {
  background: var(--theme-bg-primary);
  color: var(--theme-text-primary);
  border: 1px solid var(--theme-border-primary);
}

/* Use standardized patterns */
.my-button {
  @extend .interactive; /* Or copy the interactive pattern */
}

/* Follow consistent naming */
.my-component-header {
  /* Clear, descriptive names */
}
```

### ❌ DON'T

```css
/* Don't use hardcoded colors */
.my-component {
  background: #ffffff; /* ❌ Use var(--theme-bg-primary) */
  color: #333333; /* ❌ Use var(--theme-text-primary) */
}

/* Don't create custom theme variables without design-tokens.css */
.my-component {
  --my-custom-bg: #f0f0f0; /* ❌ Add to design-tokens.css instead */
}

/* Don't duplicate dark mode logic */
body.dark-mode .my-component {
  background: #1a1a1a; /* ❌ Theme tokens handle this automatically */
}
```

## 🧪 Theme Validation

### Development Testing

Run theme validation in browser console:

```javascript
// Validate all themes
await validateTheme();

// Manual validation
const validator = new ThemeValidator();
const result = await validator.runFullValidation();
```

### Automated Checks

The theme validator automatically:

- ✅ Validates all required tokens exist
- ✅ Tests theme switching functionality
- ✅ Checks contrast ratio compliance
- ✅ Detects unused tokens
- ✅ Generates comprehensive reports

### Console Output Example

```
🎨 Theme Token Validation
✅ --theme-bg-primary: #ffffff
✅ --theme-text-primary: #0d1117
✅ --theme-border-primary: #d1d9e0

🔄 Theme Switching Test
✅ light theme: All tokens valid
✅ dark theme: All tokens valid
✅ high-contrast theme: All tokens valid

🔍 Contrast Validation
✅ Contrast ratio: 7.23 (WCAG AA compliant)

📊 Validation Summary
✅ Passed: 45
❌ Failed: 0
⚠️  Warnings: 2
🎯 Overall Result: PASS
```

## 🚀 Migration Guide

### Updating Existing Components

1. **Replace hardcoded colors:**

   ```css
   /* Before */
   .component {
     background: #ffffff;
     color: #333333;
     border: 1px solid #e2e8f0;
   }

   /* After */
   .component {
     background: var(--theme-bg-primary);
     color: var(--theme-text-primary);
     border: 1px solid var(--theme-border-primary);
   }
   ```

2. **Remove duplicate dark mode definitions:**

   ```css
   /* Before */
   body.dark-mode .component {
     background: #1a1a1a;
     color: #ffffff;
     border: 1px solid #444444;
   }

   /* After */
   /* No dark mode override needed - tokens handle it automatically */
   ```

3. **Use standardized patterns:**

   ```css
   /* Before */
   .my-button {
     background: #f0f0f0;
     padding: 8px 16px;
     border: 1px solid #ccc;
     cursor: pointer;
   }

   /* After */
   .my-button {
     background: var(--theme-bg-interactive);
     color: var(--theme-text-primary);
     border: 1px solid var(--theme-border-interactive);
     padding: var(--space-2) var(--space-4);
     cursor: pointer;
     transition: all var(--duration-200) ease;
   }

   .my-button:hover {
     opacity: var(--theme-hover-opacity);
     border-color: var(--theme-border-focus);
     box-shadow: 0 2px 8px var(--theme-shadow-medium);
   }
   ```

## 📊 Benefits

### For Developers

- 🎯 **Consistent API**: Single set of theme tokens across all components
- 🔧 **Easy Maintenance**: Centralized theme definitions
- 🧪 **Built-in Validation**: Automatic theme testing and validation
- 📐 **Standardized Patterns**: Proven component patterns for common use cases

### For Users

- 🌙 **Automatic Dark Mode**: Respects system preferences
- ♿ **Accessibility**: High contrast mode and focus indicators
- 🎨 **Consistent Experience**: Unified visual design across all features
- ⚡ **Performance**: Optimized CSS with minimal redundancy

### For Design System

- 📏 **Scalable**: Easy to add new themes and components
- 🔒 **Reliable**: Validation prevents theme inconsistencies
- 📝 **Documented**: Clear patterns and implementation guidelines
- 🎯 **Future-Proof**: Extensible architecture for new requirements

## 🔍 Troubleshooting

### Common Issues

**Theme tokens not working:**

- Ensure `design-tokens.css` loads before component CSS
- Check that tokens are spelled correctly (case-sensitive)
- Verify component CSS follows standardized patterns

**Dark mode not applying:**

- Confirm `body.dark-mode` class is being added
- Check that component uses theme tokens, not hardcoded colors
- Validate tokens are defined in design-tokens.css

**Validation failures:**

- Run `validateTheme()` in console for detailed error report
- Check browser console for missing token warnings
- Ensure all required tokens are defined and accessible

### Getting Help

1. **Run validation:** `validateTheme()` in browser console
2. **Check console:** Look for theme-related warnings/errors
3. **Review patterns:** Ensure components follow standardized patterns
4. **Test switching:** Manually test light/dark/high-contrast modes

---

_This theme system ensures SimulateAI maintains a consistent, accessible, and maintainable visual design across all components and user experiences._
