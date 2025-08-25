# 🔥 Firebase Performance Monitoring - Trace Names Reference

## Overview

Firebase Performance Monitoring automatically tracks some traces and allows custom traces. Here are
the standard trace names you should use for SimulateAI.

## 📊 **Automatic Traces (Firebase handles these)**

### Network Request Traces

These are automatically tracked by Firebase Performance SDK:

```javascript
// Firebase automatically tracks these HTTP requests:
'_st_firebase_request'; // Firebase API calls
'_st_firestore_request'; // Firestore operations
'_st_storage_request'; // Firebase Storage operations
'_st_auth_request'; // Firebase Auth operations
'_st_functions_request'; // Cloud Functions calls
'_st_analytics_request'; // Analytics API calls
```

### Page Load Traces

Automatically tracked for web apps:

```javascript
'_wt_'; // Automatic page load trace (web)
'_st_'; // Automatic screen trace (mobile apps)
```

## 🎯 **Custom Trace Names for SimulateAI**

### Application Load & Navigation

```javascript
// Page load and navigation
'app_initialization'; // Full app startup time
'page_load_home'; // Homepage load time
'page_load_simulation'; // Simulation page load
'page_load_analytics'; // Analytics dashboard load
'navigation_transition'; // Page-to-page navigation
'pwa_app_launch'; // PWA app launch time
'service_worker_init'; // Service worker initialization
```

### User Authentication & Profile

```javascript
// Authentication flows
'auth_sign_in'; // User sign-in process
'auth_sign_up'; // User registration
'auth_sign_out'; // Sign-out process
'auth_profile_load'; // User profile loading
'auth_google_signin'; // Google OAuth sign-in
'auth_facebook_signin'; // Facebook OAuth sign-in
'profile_picture_upload'; // Profile image upload
```

### Simulation & Content

```javascript
// Simulation performance
'simulation_load'; // Loading a simulation scenario
'simulation_start'; // Starting a simulation
'simulation_decision'; // Making a decision in simulation
'simulation_complete'; // Completing a simulation
'scenario_generation'; // AI scenario generation
'ethics_analysis'; // Ethics framework analysis
'content_recommendation'; // Content recommendation engine
```

### Data Operations

```javascript
// Database operations
'firestore_user_create'; // Creating user in Firestore
'firestore_data_sync'; // Data synchronization
'data_connect_query'; // Data Connect SQL queries
'hybrid_data_operation'; // Hybrid data service operations
'cache_operation'; // Cache read/write operations
'offline_sync'; // Offline data synchronization
```

### File & Storage Operations

```javascript
// Storage and file operations
'file_upload'; // File upload process
'file_download'; // File download process
'image_processing'; // Image processing/resizing
'ai_content_analysis'; // AI content analysis
'malware_scan'; // Security malware scanning
'storage_backup'; // Backup operations
```

### AI & ML Operations

```javascript
// AI/ML processing
'ai_image_analysis'; // AI image recognition
'ai_text_analysis'; // AI text processing
'ai_sentiment_analysis'; // Sentiment analysis
'ai_recommendation'; // AI recommendation engine
'ml_model_inference'; // Machine learning inference
'ethics_scoring'; // Ethics decision scoring
```

### Analytics & Reporting

```javascript
// Analytics operations
'analytics_query'; // Analytics data queries
'report_generation'; // Report generation
'dashboard_load'; // Dashboard loading
'chart_rendering'; // Chart/graph rendering
'export_data'; // Data export operations
'real_time_updates'; // Real-time data updates
```

### Forum & Community

```javascript
// Community features
'forum_post_load'; // Loading forum posts
'forum_post_create'; // Creating new post
'comment_thread_load'; // Loading comment threads
'user_interaction'; // User interaction tracking
'notification_delivery'; // Push notification delivery
```

### Security & Performance

```javascript
// Security operations
'security_validation'; // Security checks
'app_check_token'; // App Check token validation
'recaptcha_verification'; // reCAPTCHA verification
'permission_check'; // Permission validation
'rate_limit_check'; // Rate limiting validation
```

## 📱 **PWA-Specific Traces**

```javascript
// Progressive Web App
'pwa_install'; // PWA installation
'pwa_cache_update'; // Cache updates
'pwa_offline_mode'; // Offline functionality
'pwa_background_sync'; // Background sync operations
'pwa_push_notification'; // Push notification handling
```

## 🔧 **Implementation Examples**

### Basic Custom Trace

```javascript
// Start a trace
const traceId = firebaseService.startPerformanceTrace('simulation_load');

// Your simulation loading code here...
await loadSimulationScenario(scenarioId);

// Stop trace with custom attributes
firebaseService.stopPerformanceTrace(traceId, {
  scenario_id: scenarioId,
  user_level: userLevel,
  load_source: 'cache', // or 'network'
});
```

### Advanced Trace with Attributes

```javascript
// Complex operation with multiple metrics
const traceId = firebaseService.startPerformanceTrace('ai_content_analysis');

try {
  const analysisResult = await analyzeContent(file);

  firebaseService.stopPerformanceTrace(traceId, {
    file_size: file.size,
    file_type: file.type,
    analysis_type: 'image_recognition',
    confidence_score: analysisResult.confidence,
    objects_detected: analysisResult.objects.length,
    success: 'true',
  });
} catch (error) {
  firebaseService.stopPerformanceTrace(traceId, {
    error_type: error.name,
    error_message: error.message,
    success: 'false',
  });
}
```

### Network Request Monitoring

```javascript
// Monitor specific API calls
const traceId = firebaseService.startPerformanceTrace('openai_api_request');

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}` },
  body: JSON.stringify(requestData),
});

firebaseService.stopPerformanceTrace(traceId, {
  response_status: response.status,
  response_size: response.headers.get('content-length'),
  model_used: requestData.model,
  tokens_requested: requestData.max_tokens,
});
```

## 📊 **Best Practices**

### Trace Naming Convention

- Use lowercase with underscores: `user_profile_load`
- Be descriptive but concise: `simulation_ethics_analysis`
- Group related traces: `auth_*`, `simulation_*`, `ai_*`
- Include context: `page_load_analytics_dashboard`

### Custom Attributes

```javascript
// Good custom attributes
{
  user_type: 'educator',        // User classification
  content_category: 'healthcare', // Content type
  performance_tier: 'premium',   // Service tier
  device_type: 'mobile',        // Device category
  connection_type: 'wifi',      // Network type
  cache_status: 'hit',          // Cache performance
  error_code: '404',            // Error tracking
  success_rate: '0.95'          // Success metrics
}
```

### Performance Monitoring Dashboard

These traces will appear in your Firebase Console under:

- **Performance → Web** for web app traces
- **Performance → Custom traces** for your custom traces
- **Performance → Network requests** for HTTP monitoring

## 🎯 **SimulateAI-Specific Recommendations**

For your AI ethics education platform, focus on these key traces:

1. **`simulation_complete`** - Track full simulation performance
2. **`ai_ethics_analysis`** - Monitor AI processing times
3. **`user_decision_tracking`** - Track decision-making performance
4. **`research_data_export`** - Monitor research data operations
5. **`forum_engagement`** - Track community interaction performance

This comprehensive monitoring will give you detailed insights into your app's performance across all
features!
