# Scroll-Aware Navigation Bar

## Overview

The shared navigation component now includes a scroll-aware navigation bar that automatically hides
when scrolling down and reappears when scrolling up, providing users with more screen real estate
while keeping the navigation easily accessible.

## Features

### Smart Hide/Show Behavior

- **Scroll Down**: Navigation bar slides up and hides after scrolling past the header height (80px)
- **Scroll Up**: Navigation bar slides down and appears when scrolling up
- **Top of Page**: Navigation bar always remains visible when at the top of the page
- **Threshold Detection**: Only responds to scroll movements of 5px or more to prevent jittery
  behavior

### Enhanced Visual Effects

- **Scrolled State**: Adds subtle shadow and backdrop blur when scrolled past header height
- **Smooth Transitions**: Uses cubic-bezier easing for smooth animations
- **Performance Optimized**: Uses `will-change: transform` and throttled scroll events (~60fps)

### Smart Persistence

The navbar will always remain visible when:

- Mobile navigation menu is open
- Any dropdown menus are active
- Settings menu is open
- User is at the top of the page

## Technical Implementation

### JavaScript (shared-navigation.js)

- **Scroll Detection**: Throttled scroll event listener
- **Direction Tracking**: Compares current scroll position with previous position
- **State Management**: Tracks scroll direction and menu states
- **Performance**: Uses `requestAnimationFrame`-like throttling at 16ms intervals

### CSS (main.css)

```css
.header {
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.header-hidden {
  transform: translateY(-100%);
}

.header.scrolled {
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
}
```

### Configuration

Default settings in the constructor:

- `scrollThreshold`: 5px minimum scroll distance
- `headerHeight`: 80px header height reference
- Throttle delay: 16ms (~60fps)

## Browser Support

- Modern browsers with CSS transform support
- Fallback: Navigation remains visible if JavaScript fails
- Mobile optimized with faster transitions

## Usage

The scroll-aware behavior is automatically enabled when the SharedNavigation component initializes.
No additional configuration required.

## Performance Considerations

- Uses passive scroll listeners for better performance
- Throttled scroll events prevent excessive function calls
- CSS transforms for hardware acceleration
- Cleanup on component destruction
