# User Metadata Tracking System

## Overview

The User Metadata Tracking System provides comprehensive insights into how users interact with the
SimulateAI application, with special focus on settings panel usage and user engagement patterns.
This system is designed to help developers understand user behavior and make data-driven
improvements to the application.

## Architecture

### Core Components

1. **UserEngagementTracker** (`src/js/services/user-engagement-tracker.js`)
   - Main tracking service that monitors user interactions
   - Tracks settings panel usage, navigation patterns, and feature adoption
   - Stores data locally and provides analytics
   - Enhanced with regional scenario decision tracking

2. **UserInsightsDashboard** (`src/js/components/user-insights-dashboard.js`)
   - Visual dashboard for displaying user insights
   - Accessible via keyboard shortcut (Ctrl+Shift+I) in development
   - Provides export functionality for data analysis

3. **RegionalAnalytics** (`src/js/services/regional-analytics.js`)
   - Geographic data collection and regional decision pattern analysis
   - Privacy-compliant location estimation from timezone and locale
   - Cross-cultural ethics preference tracking
   - Global trend analysis and regional comparisons

4. **RegionalAnalyticsDashboard** (`src/js/components/regional-analytics-dashboard.js`)
   - Interactive dashboard for regional analytics visualization
   - Geographic decision heatmaps and cultural trend analysis
   - Regional ethics comparisons and global insights
   - Export functionality for research data

5. **Settings Manager Integration** (`src/js/components/settings-manager.js`)
   - Enhanced with tracking calls for all settings changes
   - Monitors panel open/close events and user interactions

## Tracked Data Categories

### 1. User Profile

- **User ID**: Unique identifier for each user
- **User Type**: Classification (new, casual, power user, etc.)
- **First Visit**: Date of first interaction
- **Onboarding Status**: Whether user completed onboarding
- **Feature Discovery Progress**: Which features the user has discovered

### 2. Settings Panel Usage

- **Panel Opens**: Number of times settings panel was opened
- **Time Spent**: Duration of each settings session
- **Settings Changed**: Which settings were modified and how often
- **Tab Switches**: Navigation between different settings tabs
- **Interaction Patterns**: Hover, click, and search behavior within settings

### 3. Engagement Metrics

- **Session Count**: Number of user sessions
- **Features Used**: List of features the user has interacted with
- **Page Views**: Navigation patterns across the application
- **Time Spent**: Total and average session duration
- **Activity Patterns**: Peak usage times and frequency

### 4. Behavior Patterns

- **User Classification**: Power user, casual user, explorer, etc.
- **Engagement Level**: Deep, moderate, or casual engagement
- **Customization Tendency**: How often user modifies settings
- **Help Seeking**: Usage of help features and documentation
- **Preferred Features**: Most frequently used functionality

### 5. Feature Adoption

- **Discovery Rate**: How quickly users find new features
- **Adoption Timeline**: When features are first used
- **Usage Frequency**: How often features are used after discovery
- **Abandonment Patterns**: Features that users try but don't continue using

### 6. Regional & Global Decision Analytics

- **Geographic Data**: Country, region, and timezone information
- **Decision Patterns**: Scenario choices aggregated by region
- **Cultural Preferences**: Ethics framework preferences by geography
- **Global Trends**: Cross-cultural decision analysis
- **Regional Comparisons**: How different regions approach ethical dilemmas

### 7. Scenario Decision Tracking

- **Decision Choices**: All scenario options selected by users
- **Decision Reasoning**: User explanations for their choices
- **Ethics Impact**: How decisions affect the 8 ethics metrics
- **Cultural Context**: Geographic and cultural factors influencing decisions
- **Global Aggregation**: Anonymized decision data for research

## Data Storage

### Local Storage Keys

- `simulateai_user_profile`: User profile and identification data
- `simulateai_engagement_metrics`: Engagement and usage metrics
- `simulateai_behavior_patterns`: Analyzed behavior patterns
- `simulateai_settings_usage`: Settings panel interaction data
- `simulateai_regional_data`: Geographic and cultural context data
- `simulateai_scenario_decisions`: Local scenario decision history
- `simulateai_global_analytics`: Aggregated regional insights cache

### Regional Analytics Storage

- `simulateai_geographic_context`: User's region, timezone, and cultural indicators
- `simulateai_decision_patterns`: Ethics decision patterns by region
- `simulateai_cultural_preferences`: Cultural ethics framework preferences
- `simulateai_global_trends`: Cross-regional decision analysis data

### Data Privacy

- All data is stored locally in the user's browser
- No personally identifiable information is collected
- Data can be cleared by the user at any time
- Designed to comply with privacy regulations

## Usage Examples

### Accessing User Insights (Development Mode)

```javascript
// Show user insights dashboard
window.userTracking.showInsights();

// Show regional analytics dashboard
window.regionalAnalytics.showDashboard();

// Get user profile
const profile = window.userTracking.getProfile();

// Get engagement metrics
const metrics = window.userTracking.getMetrics();

// Generate comprehensive insights
const insights = window.userTracking.generateInsights();

// Get regional insights
const regionalInsights = window.regionalAnalytics.generateRegionalInsights();
```

### Manual Tracking Events

```javascript
// Track custom user interaction
userEngagementTracker.trackUserEvent('custom_feature_used', {
  feature: 'advanced_search',
  context: 'scenario_browser',
  userType: 'power_user',
});

// Track settings panel interaction
userEngagementTracker.trackSettingsPanelOpen(event);

// Track scenario decision with regional context
userEngagementTracker.trackScenarioDecisionWithRegionalContext(event);
```

### Regional Analytics Examples

```javascript
// Get regional analytics status
const status = regionalAnalytics.getStatus();

// Export regional data
const exportData = regionalAnalytics.exportRegionalData();

// Clear regional data
regionalAnalytics.clearRegionalData();

// Get geographic context
const geographic = regionalAnalytics.geographicData;
```

## Integration Points

### 1. Settings Manager

All settings changes are automatically tracked:

- Theme changes
- Font size adjustments
- Accessibility settings
- Interface toggles

### 2. Navigation Events

User navigation is monitored:

- Page transitions
- Menu interactions
- Feature discovery

### 3. Feature Usage

Feature interactions are tracked:

- Scenario selections
- Search usage
- Filter applications
- Simulation starts

## Insights Generated

### User Type Classifications

- **Power User**: High settings changes (>10) and feature usage (>15)
- **Customizer**: Moderate settings changes (>5)
- **Explorer**: High feature usage (>10)
- **Goal-Oriented**: Regular sessions (>5)
- **Casual User**: Basic usage patterns

### Engagement Levels

- **Deep**: >2 minutes in settings panel
- **Engaged**: 30 seconds to 2 minutes
- **Quick**: <30 seconds
- **Power User**: Extended engagement patterns

### Recommendations

The system generates actionable recommendations:

- **Low Engagement**: Improve onboarding experience
- **Settings Discovery**: Make settings more discoverable
- **Feature Adoption**: Add feature discovery prompts
- **Power User**: Provide advanced features and shortcuts

## Performance Considerations

### Efficient Data Collection

- Debounced scroll and input events
- Batched data storage
- Minimal memory footprint
- Automatic cleanup of old data

### Storage Limits

- Maximum 100 entries per data category
- Automatic pruning of old data
- Configurable retention periods
- Export functionality for long-term storage

## Development Tools

### Keyboard Shortcuts

- **Ctrl+Shift+I**: Toggle user insights dashboard (development mode)
- **Ctrl+Shift+R**: Toggle regional analytics dashboard (development mode)

### Console API

Access tracking data via `window.userTracking`:

- `showInsights()`: Open user insights dashboard
- `getProfile()`: Get user profile data
- `getMetrics()`: Get engagement metrics
- `getPatterns()`: Get behavior patterns
- `generateInsights()`: Generate comprehensive insights

Access regional analytics via `window.regionalAnalytics`:

- `showDashboard()`: Open regional analytics dashboard
- `getStatus()`: Get regional analytics status
- `generateRegionalInsights()`: Generate regional insights
- `exportRegionalData()`: Export regional analytics data
- `clearRegionalData()`: Clear all regional data

### Data Export

- JSON export of all tracking data
- Timestamped export files
- Comprehensive data structure for analysis

## Future Enhancements

### Planned Features

1. **Heat Map Visualization**: Visual representation of user interaction patterns
2. **A/B Testing Integration**: Compare user behavior across different features
3. **Predictive Analytics**: Predict user churn and engagement
4. **Real-time Insights**: Live dashboard updates
5. **Custom Event Tracking**: Developer-defined custom events
6. **IP-Based Geolocation**: More precise geographic data collection
7. **Cultural Adaptation Engine**: Dynamic content adaptation based on regional preferences
8. **Cross-Platform Analytics**: Unified analytics across multiple devices
9. **Privacy-Enhanced Tracking**: Advanced privacy controls and anonymization

### Enhanced Regional Features

- **Machine Learning Models**: Predictive models for regional behavior patterns
- **Cultural Sensitivity Analysis**: Automatic detection of culturally sensitive content
- **Regional A/B Testing**: Test different approaches across regions
- **Collaborative Filtering**: Regional recommendation systems
- **Cultural Competency Scoring**: Measure cross-cultural understanding

### Analytics Integration

- Firebase Analytics integration ready
- Custom event definitions
- User journey mapping
- Conversion funnel analysis

## Usage Guidelines

### Best Practices

1. **Respect User Privacy**: Only collect necessary data
2. **Provide Value**: Use insights to improve user experience
3. **Transparent Data Usage**: Inform users about data collection
4. **Data Minimization**: Collect only what's needed
5. **Regular Cleanup**: Implement data retention policies

### Compliance

- GDPR compliance ready
- Privacy by design
- User consent management
- Data portability support

## API Reference

### UserEngagementTracker Methods

```javascript
// Track user events
trackUserEvent(eventName, data);

// Track settings interactions
trackSettingsPanelOpen(event);
trackSettingsPanelClose(event);
trackSettingsChange(event);

// Get user data
getUserProfile();
getEngagementMetrics();
getBehaviorPatterns();
getSettingsUsage();

// Generate insights
generateInsights();
analyzeBehaviorPatterns();
```

### UserInsightsDashboard Methods

```javascript
// Dashboard control
showDashboard();
hideDashboard();
toggle();

// Data export
exportInsights();

// Refresh data
loadInsights();
```

## Troubleshooting

### Common Issues

1. **Data Not Appearing**: Check browser console for errors
2. **Dashboard Not Opening**: Verify development mode and keyboard shortcut
3. **Storage Errors**: Check browser storage limits
4. **Performance Issues**: Review data collection frequency

### Debug Mode

Enable debug logging by setting `logger.level = 'debug'` in browser console.

## Conclusion

The User Metadata Tracking System provides comprehensive insights into user behavior and settings
usage patterns. By analyzing this data, developers can make informed decisions about interface
improvements, feature development, and user experience optimization.

The system is designed to be privacy-conscious, performant, and developer-friendly, providing
valuable insights while respecting user privacy and maintaining application performance.
