# Infinite Loop Troubleshooting Guide

## 🔍 Overview

This guide provides tools and techniques for detecting, preventing, and resolving infinite loops in the SimulateAI codebase.

## 🚨 Recent Issue Resolved

**OnboardingTour Positioning Loop**: Fixed infinite recursion in `positionCoachMark()` method that was causing hundreds of positioning calls per second.

### Root Cause
- `positionCoachMark()` would recursively call itself when target elements were outside viewport
- `MutationObserver` triggered repositioning on every content change
- No retry limits or transition guards

### Solution Applied
- Added retry counter with `MAX_POSITION_RETRIES = 3`
- Added transition state guards in content observer
- Added missing `CONTENT_UPDATE_DELAY` constant

## 🛠️ Debugging Tools

### 1. Loop Detection Utilities

#### Function Call Tracker
```javascript
// Global utilities added to window for debugging
window.debugUtils = {
  trackCalls: (obj, methodName, maxCalls = 10) => { /* tracks excessive calls */ },
  stopTracking: (obj, methodName) => { /* removes tracking */ },
  getCallStats: () => { /* shows call statistics */ }
};
```

#### Emergency Stop
```javascript
// Emergency stop for runaway processes
window.emergencyStop = () => {
  // Stops all timeouts, intervals, and observers
};
```

### 2. Common Infinite Loop Patterns

#### A. Recursive Function Calls
```javascript
// ❌ BAD: No exit condition
function badRecursion(element) {
  if (element.needsUpdate()) {
    updateElement(element);
    badRecursion(element); // Can loop forever
  }
}

// ✅ GOOD: With retry limit
function goodRecursion(element, retryCount = 0) {
  const MAX_RETRIES = 5;
  if (retryCount > MAX_RETRIES) {
    console.warn('Max retries reached');
    return;
  }
  
  if (element.needsUpdate()) {
    updateElement(element);
    goodRecursion(element, retryCount + 1);
  }
}
```

#### B. Event Listener Loops
```javascript
// ❌ BAD: Event triggers itself
element.addEventListener('update', () => {
  element.dispatchEvent(new Event('update')); // Infinite loop!
});

// ✅ GOOD: With guard flag
let isUpdating = false;
element.addEventListener('update', () => {
  if (isUpdating) return;
  isUpdating = true;
  // Do work
  isUpdating = false;
});
```

#### C. Observer Loops
```javascript
// ❌ BAD: Observer triggers itself
const observer = new MutationObserver(() => {
  element.style.color = 'red'; // Triggers observer again!
});

// ✅ GOOD: With disconnect/reconnect
const observer = new MutationObserver(() => {
  observer.disconnect();
  element.style.color = 'red';
  observer.observe(element, config);
});
```

## 🔧 Implementation Strategy

### 1. **Infinite Loop Detector Added** ✅

Created `src/js/utils/infinite-loop-detector.js` with comprehensive monitoring:

- **Call Frequency Tracking**: Monitors functions for excessive calls (>50/second)
- **Stack Depth Analysis**: Detects deep recursion (>100 levels)
- **Pattern Recognition**: Identifies repetitive function patterns in call stack
- **Emergency Stop**: Automatically halts runaway processes
- **Development Mode**: Only active in development/localhost environments

### 2. **Integration with Main App** ✅

Added to `src/js/app.js`:
- Import and initialize loop detector
- Instrument critical OnboardingTour methods
- Enable only in development mode for performance

### 3. **Test Page Created** ✅

Created `test-loop-detection.html` for testing:
- Manual controls for detector management
- Test scenarios for different loop types
- Live console output monitoring
- Statistics display

### 4. High-Risk Areas to Monitor

- **Modal Systems**: Opening/closing cycles
- **Scroll Handlers**: Position updates
- **Animation Systems**: Frame loops
- **Data Fetching**: Retry mechanisms
- **State Management**: Update cascades

### 2. Prevention Techniques

#### A. Add Retry Limits
```javascript
class SafeRetryHandler {
  constructor(maxRetries = 5) {
    this.maxRetries = maxRetries;
    this.retryCount = 0;
  }
  
  attempt(operation) {
    if (this.retryCount > this.maxRetries) {
      throw new Error('Max retries exceeded');
    }
    this.retryCount++;
    return operation();
  }
  
  reset() {
    this.retryCount = 0;
  }
}
```

#### B. Debounce Rapid Calls
```javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
```

#### C. Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(threshold = 10, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = 0;
  }
  
  call(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

## 🔍 Detection Methods

### 1. Performance Monitoring
```javascript
// Monitor function execution frequency
const executionFrequency = new Map();

function trackExecution(functionName) {
  const now = Date.now();
  const history = executionFrequency.get(functionName) || [];
  
  // Keep only last 1 second of calls
  const recent = history.filter(time => now - time < 1000);
  recent.push(now);
  
  executionFrequency.set(functionName, recent);
  
  if (recent.length > 50) { // More than 50 calls per second
    console.warn(`⚠️ Potential infinite loop detected in ${functionName}:`, recent.length, 'calls/sec');
  }
}
```

### 2. Call Stack Analysis
```javascript
function detectRecursion(maxDepth = 100) {
  const stack = new Error().stack;
  const lines = stack.split('\n');
  
  if (lines.length > maxDepth) {
    console.warn('⚠️ Deep call stack detected:', lines.length, 'levels');
    return true;
  }
  
  // Check for repetitive patterns
  const functionNames = lines.map(line => {
    const match = line.match(/at (\w+)/);
    return match ? match[1] : null;
  }).filter(Boolean);
  
  const nameCount = {};
  for (const name of functionNames) {
    nameCount[name] = (nameCount[name] || 0) + 1;
    if (nameCount[name] > 10) {
      console.warn(`⚠️ Recursive pattern detected: ${name} appears ${nameCount[name]} times in stack`);
      return true;
    }
  }
  
  return false;
}
```

## 🚀 Quick Fixes

### 1. Emergency Stop Function
```javascript
window.emergencyStop = function() {
  // Clear all timeouts
  for (let i = 1; i < 99999; i++) {
    window.clearTimeout(i);
    window.clearInterval(i);
  }
  
  // Disconnect all observers
  if (window.onboardingTour?.contentObserver) {
    window.onboardingTour.contentObserver.disconnect();
  }
  
  console.log('🛑 Emergency stop executed - all timers and observers cleared');
};
```

### 2. Function Call Limiter
```javascript
function limitCalls(func, maxCalls, timeWindow = 1000) {
  const calls = [];
  
  return function(...args) {
    const now = Date.now();
    
    // Remove old calls outside time window
    while (calls.length > 0 && now - calls[0] > timeWindow) {
      calls.shift();
    }
    
    if (calls.length >= maxCalls) {
      console.warn(`⚠️ Function call limit reached: ${maxCalls} calls in ${timeWindow}ms`);
      return;
    }
    
    calls.push(now);
    return func.apply(this, args);
  };
}
```

## 🚀 Usage Instructions

### 1. **Accessing the Loop Detector**

In development mode (localhost or `?debug=true`):
```javascript
// Global access
window.loopDetector

// Debug utilities
window.debugUtils.getStats()
window.debugUtils.emergencyStop()
window.debugUtils.reset()
```

### 2. **Manual Function Tracking**

```javascript
// Track a specific function
window.debugUtils.trackFunction(myObject, 'methodName')

// Or manually track executions
import { loopDetector } from './src/js/utils/infinite-loop-detector.js'
loopDetector.trackExecution('MyFunction.myMethod')
```

### 3. **Testing Loop Detection**

Open `test-loop-detection.html` to:
- Test various loop scenarios
- Monitor detection effectiveness
- View live statistics
- Practice emergency procedures

### 4. **Reading Detection Warnings**

```javascript
// Example warning messages:
"🚨 POTENTIAL LOOP: positionCoachMark called 55 times in 1000ms"
"🚨 POTENTIAL LOOP: Deep call stack detected: 120 levels in showStep"
"🚨 POTENTIAL LOOP: Recursive pattern: nextStep appears 15 times in stack"
```

### 5. **Emergency Procedures**

If you encounter a runaway process:
1. Open browser console
2. Type: `window.debugUtils.emergencyStop('Manual stop')`
3. This will clear all timers, disconnect observers, and stop animations

## 📊 Monitoring Dashboard

The loop detector provides comprehensive statistics:

```javascript
{
  "totalFunctions": 15,
  "isEnabled": true,
  "emergencyStopExecuted": false,
  "topCallers": [
    {
      "name": "OnboardingTour.positionCoachMark",
      "totalCalls": 347,
      "recentCalls": 0
    }
  ],
  "incidents": [
    {
      "timestamp": "2025-07-08T04:30:00.000Z",
      "functionName": "OnboardingTour.positionCoachMark",
      "count": 55,
      "type": "EXCESSIVE_CALLS"
    }
  ]
}
```

## 📋 Checklist for New Code

- [ ] Add retry limits to recursive functions
- [ ] Implement debouncing for rapid-fire events
- [ ] Add guards to prevent self-triggering
- [ ] Use circuit breakers for external calls
- [ ] Monitor execution frequency in development
- [ ] Test with edge cases and error conditions
- [ ] Add logging for debugging purposes

## 🎯 Files to Monitor

Based on the codebase structure, these files are high-risk for infinite loops:

### Critical Files
- `src/js/components/onboarding-tour.js` ✅ (Recently fixed)
- `src/js/components/enhanced-simulation-modal.js`
- `src/js/components/scenario-modal.js`
- `src/js/core/animation-manager.js`
- `src/js/utils/scroll-manager.js`

### Modal-Related Files
- `src/js/components/modal-utility.js`
- `src/js/components/pre-launch-modal.js`
- `src/js/components/post-simulation-modal.js`

### Event Handlers
- `src/js/app.js`
- `src/js/core/ui.js`
- `src/js/utils/focus-manager.js`

## 🔧 Next Steps

1. **Implement Debug Utilities**: Add the debugging tools to `app.js`
2. **Add Monitoring**: Instrument high-risk functions with call tracking
3. **Create Tests**: Write tests that intentionally trigger loops to verify fixes
4. **Documentation**: Update function documentation with loop prevention notes
5. **Code Review**: Establish checklist for reviewing loop-prone patterns

## 📚 Resources

- [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [JavaScript Debouncing](https://davidwalsh.name/javascript-debounce-function)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
