# SimulateAI Onboarding Tour System

## Overview
The onboarding tour system provides a comprehensive guided walkthrough for first-time users, consisting of three main tutorials that introduce the core features of the SimulateAI platform.

## Tour Structure

### Tutorial 1: Test Modal Tutorial (Steps 1-9)
**Purpose**: Introduces users to the basic scenario interaction flow
- **Step 1**: Welcome message with option to continue or skip
- **Step 2**: Prompts user to click "Quick Test" button
- **Step 3**: Explains the dilemma section in the scenario modal
- **Step 4**: Explains the ethical question section
- **Step 5**: Explains choosing an approach and waits for user selection
- **Step 6**: Explains pros and cons of ethical choices
- **Step 7**: Explains the radar chart and ethical dimensions
- **Step 8**: Prompts user to confirm their choice
- **Step 9**: Tutorial completion with option to continue to next tutorial

### Tutorial 2: Radar Chart Tutorial (Steps 10-15)
**Purpose**: Deep dive into understanding and interpreting radar charts
- **Step 10**: Introduction to Hero Demo radar chart
- **Step 11**: Explanation of ethical dimensions
- **Step 12**: Interactive controls demonstration
- **Step 13**: "How to Read Radar Chart" section highlight
- **Step 14**: "Ethical Dimensions Glossary" section highlight
- **Step 15**: Tutorial completion with option to continue to next tutorial

### Tutorial 3: Learning Lab Tutorial (Steps 16-23)
**Purpose**: Comprehensive overview of Learning Lab features
- **Step 16**: Introduction to Learning Labs concept
- **Step 17-22**: Explanation of each tab (Overview, Learning Goals, Ethics Guide, Get Ready, Resources, For Educators)
- **Step 23**: Final congratulations and tour completion

## How It Works

### Automatic Activation
- The tour automatically starts for first-time visitors
- Uses localStorage to track visit status and tour completion
- Once completed, users won't see the tour again unless manually triggered

### Manual Activation
- Users can restart the tour by clicking the "📚 Take Tour" button in navigation
- Developers can trigger specific tutorials using: `OnboardingTour.startManualTour(tutorialNumber)`
- Tour progress can be reset using: `OnboardingTour.resetTour()`

### Technical Features

#### Smart Element Targeting
- Automatically waits for modal elements to appear
- Handles dynamic content loading
- Positions tour modals intelligently around target elements

#### Event-Driven Progression
- Waits for actual user interactions (clicks, selections) before proceeding
- Listens for custom events like 'option-selected' and 'scenario-completed'
- Handles timeout scenarios gracefully

#### Responsive Design
- Adapts modal positioning for mobile devices
- Supports high contrast and reduced motion preferences
- Maintains accessibility standards with proper ARIA attributes

#### Analytics Integration
- Tracks tour start, completion, and step progression
- Records which tutorials users complete
- Provides insights into user onboarding success

## Files Structure

```
src/js/components/onboarding-tour.js    - Main tour component
src/styles/onboarding-tour.css          - Tour styling
```

### Integration Points
- **app.js**: Tour initialization and manual controls
- **index.html**: CSS inclusion and navigation button
- **category.html**: CSS inclusion and navigation button

## Customization

### Adding New Steps
1. Edit the `tutorials` object in `onboarding-tour.js`
2. Add step configuration with:
   - `id`: Unique identifier
   - `title`: Step title
   - `content`: Step description
   - `buttons`: Array of button configurations
   - `target`: CSS selector for element to highlight
   - `position`: Modal positioning ('top', 'bottom', 'left', 'right', 'center')
   - `action`: Special actions like 'wait-for-click' or 'highlight-element'
   - `waitFor`: Condition to wait for before showing step

### Styling Customization
- Tour uses CSS custom properties for easy theming
- Supports dark mode and high contrast automatically
- Animation and transition timing can be adjusted via CSS variables

### Event Integration
- Tour listens for specific events to advance automatically
- Custom events can be dispatched to trigger tour progression
- Event handlers are properly cleaned up when tour ends

## Best Practices

### For Developers
- Test tour flow after any UI changes
- Ensure target elements have stable selectors
- Verify tour works on both desktop and mobile
- Check that tour content remains accurate with feature updates

### For Content Updates
- Keep step descriptions concise but informative
- Use action-oriented language ("Click here", "Select an option")
- Ensure tour matches actual UI elements and behavior
- Test tour flow with real user scenarios

## Troubleshooting

### Common Issues
1. **Tour doesn't start**: Check localStorage keys and first-visit detection
2. **Elements not found**: Verify target selectors are correct and elements exist
3. **Modal positioning issues**: Check CSS and responsive breakpoints
4. **Event handling problems**: Ensure custom events are properly dispatched

### Debug Mode
- Check browser console for tour-related logs
- Use `OnboardingTour.resetTour()` to clear stored progress
- Monitor event listeners in developer tools

## Future Enhancements

### Potential Improvements
- Branch tutorials based on user role (student vs educator)
- Add skip-ahead options for experienced users
- Include interactive hints system for ongoing help
- Implement tour analytics dashboard
- Add tour progress saving/resuming capability

### Integration Opportunities
- Connect with user preference system
- Integrate with achievement/badge system
- Add contextual help system beyond initial tour
- Create advanced feature tutorials for power users
