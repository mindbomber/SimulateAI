# 🔥 Firebase Performance Monitoring - Quick Start Guide

## ✅ **Status: Ready to Generate Traces!**

Your Firebase Performance Monitoring is now **properly integrated** and ready to use. Here's what we
just set up:

### **What's Now Working:**

1. ✅ **Firebase Performance SDK** - Properly imported and initialized
2. ✅ **Performance Tracing Service** - Custom trace management
3. ✅ **Integration Complete** - Connected to your main Firebase service
4. ✅ **Test Page Ready** - Live demo generating real traces

---

## 🚀 **How to See Traces in Firebase Console**

### **Step 1: Generate Some Traces**

**Open the test page:** http://localhost:3004/firebase-performance-test.html

Click these buttons to generate traces:

- 📊 **Start Basic Trace** - Creates `test_basic_trace`
- 🤖 **Test Simulation Load** - Creates `simulation_load`
- 🔐 **Test Auth Sign-In** - Creates `auth_sign_in`
- 🧠 **Test AI Analysis** - Creates `ai_content_analysis`

### **Step 2: Check Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your **SimulateAI** project
3. Navigate to **Performance** tab
4. Look under **Custom traces** section

### **Step 3: What You'll See**

After generating traces, you should see:

```
Custom traces:
├── test_basic_trace
├── simulation_load
├── auth_sign_in
├── ai_content_analysis
├── ethics_analysis
├── scenario_generation
└── content_recommendation
```

---

## 🔧 **How to Use in Your App**

### **Basic Usage**

```javascript
// Start a trace
const traceId = firebaseService.startPerformanceTrace('simulation_load');

// Your code here...
await loadSimulation(scenarioId);

// Stop trace with custom data
firebaseService.stopPerformanceTrace(traceId, {
  scenario_id: scenarioId,
  user_level: 'advanced',
  success: true,
});
```

### **Pre-defined Trace Names**

```javascript
// Use predefined trace names for consistency
import { PerformanceTracing } from './src/js/services/performance-tracing.js';

const traceId = firebaseService.startPerformanceTrace(
  PerformanceTracing.TRACE_NAMES.SIMULATION_LOAD
);
```

### **High-Level Tracking Methods**

```javascript
// Convenient methods for common operations
firebaseService.trackAuthSignIn('google', { new_user: false });
firebaseService.trackSimulationFlow('scenario_001', { difficulty: 'hard' });
firebaseService.trackAIOperation('content_analysis', { model: 'gpt-4' });
```

---

## 📊 **Automatic Traces (Already Working)**

Firebase automatically tracks these without any code:

```javascript
// Network requests (automatic)
'_st_firebase_request'; // Firebase API calls
'_st_firestore_request'; // Firestore operations
'_st_storage_request'; // Storage operations
'_st_auth_request'; // Auth operations

// Page performance (automatic)
'_wt_'; // Page load times
```

---

## 🎯 **Next Steps**

### **1. Add to Your Main App**

Add performance tracking to key operations:

```javascript
// In app.js - track app initialization
const initTrace = firebaseService.startPerformanceTrace('app_initialization');
// ... app initialization code ...
firebaseService.stopPerformanceTrace(initTrace);

// In simulation code - track simulation performance
const simTrace = firebaseService.trackSimulationFlow(scenarioId);
// ... simulation logic ...
performanceTracing.stopTrace(simTrace, { success: true });
```

### **2. Monitor Critical Paths**

Focus on these key areas:

- **User sign-in flow** - `auth_sign_in`
- **Simulation loading** - `simulation_load`
- **AI content analysis** - `ai_content_analysis`
- **Ethics framework switching** - `ethics_analysis`

### **3. Set Up Alerts**

In Firebase Console → Performance → Alerts:

- Set up alerts for slow traces (>3 seconds)
- Monitor 95th percentile performance
- Track error rates

---

## 🐛 **Troubleshooting**

### **If No Traces Appear:**

1. **Check Console Errors** - Open browser dev tools
2. **Verify Firebase Config** - Ensure project ID is correct
3. **Wait 5-10 minutes** - Firebase has some delay in showing data
4. **Generate More Data** - Click test buttons multiple times

### **Common Issues:**

```javascript
// ❌ This won't work (typo in trace name)
firebaseService.startPerformanceTrace('simulaton_load');

// ✅ Use predefined names to avoid typos
firebaseService.startPerformanceTrace(PerformanceTracing.TRACE_NAMES.SIMULATION_LOAD);
```

---

## 📈 **Expected Timeline**

- **Immediate**: Test page generates traces
- **5-10 minutes**: Traces appear in Firebase Console
- **1 hour**: Full analytics and percentile data
- **24 hours**: Historical trends and comparisons

---

## 🎉 **Success Indicators**

You'll know it's working when you see:

1. ✅ **Test page runs without errors**
2. ✅ **Traces appear in Firebase Console → Performance → Custom traces**
3. ✅ **Duration data shows realistic timings**
4. ✅ **Custom attributes appear with trace details**

Your Firebase Performance Monitoring is now **production-ready**! 🚀
