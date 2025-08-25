/**
 * Emergency Firebase 400 Error Fix Script
 * CRITICAL: Immediate fix for excessive Firebase Firestore writes
 *
 * Instructions:
 * 1. Run this script to temporarily disable problematic Firebase calls
 * 2. Monitor browser console for reduced errors
 * 3. Re-enable when ready by setting EMERGENCY_DISABLE = false
 */

// EMERGENCY DISABLE FLAG - Set to false to re-enable Firebase tracking
const EMERGENCY_DISABLE = true; // ENABLED - Stopping Firebase errors immediately

// Quiet by default; show banner only if verbose flags are set
const __emergencyVerbose = (() => {
  try {
    return (
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("debug") === "true" ||
          localStorage.getItem("verbose-logs") === "true")) ||
      false
    );
  } catch (_) {
    return false;
  }
})();

if (__emergencyVerbose) {
  console.log("🚨 Firebase 400 Error Emergency Fix Script Loaded");
  console.log(
    `🔧 Emergency Disable Status: ${EMERGENCY_DISABLE ? "ACTIVE" : "INACTIVE"}`,
  );
}

// Emergency fix for PWA Service if it exists
if (typeof window !== "undefined" && window.app && window.app.pwaService) {
  const originalTrackPWAEvent = window.app.pwaService.trackPWAEvent;

  window.app.pwaService.trackPWAEvent = function (eventName, data = {}) {
    if (EMERGENCY_DISABLE) {
      console.log(`🚫 EMERGENCY: Blocking PWA event: ${eventName}`, data);
      return;
    }

    // Rate limiting even when not in emergency mode
    if (!this.eventThrottle) this.eventThrottle = new Map();

    const now = Date.now();
    const key = `pwa_${eventName}`;
    const lastEvent = this.eventThrottle.get(key) || 0;

    if (now - lastEvent < 6000) {
      // 6 seconds between same events
      console.log(`⚠️ Throttling PWA event: ${eventName}`);
      return;
    }

    this.eventThrottle.set(key, now);

    // Call original method with error handling
    try {
      return originalTrackPWAEvent.call(this, eventName, data);
    } catch (error) {
      console.warn(`PWA event tracking failed: ${eventName}`, error);
    }
  };

  __emergencyVerbose && console.log("✅ PWA Service emergency fix applied");
}

// Emergency fix for Firebase Service if it exists
if (typeof window !== "undefined" && window.app && window.app.firebaseService) {
  const originalTrackStorageEvent =
    window.app.firebaseService.trackStorageEvent;

  window.app.firebaseService.trackStorageEvent = function (
    eventType,
    data = {},
  ) {
    if (EMERGENCY_DISABLE) {
      console.log(
        `🚫 EMERGENCY: Blocking Firebase storage event: ${eventType}`,
        data,
      );
      return Promise.resolve({ blocked: true, reason: "emergency_disable" });
    }

    // Rate limiting for Firebase events
    if (!this.firebaseEventThrottle) this.firebaseEventThrottle = new Map();

    const now = Date.now();
    const lastEvent = this.firebaseEventThrottle.get(eventType) || 0;

    if (now - lastEvent < 3000) {
      // 3 seconds between Firebase events
      console.log(`⚠️ Throttling Firebase event: ${eventType}`);
      return Promise.resolve({ throttled: true, eventType });
    }

    this.firebaseEventThrottle.set(eventType, now);

    // Call original method with enhanced error handling
    try {
      return originalTrackStorageEvent.call(this, eventType, data);
    } catch (error) {
      console.warn(`Firebase storage event failed: ${eventType}`, error);
      return Promise.reject(error);
    }
  };

  __emergencyVerbose &&
    console.log("✅ Firebase Service emergency fix applied");
}

// Monitor Firebase errors and auto-enable emergency mode if needed
let firebaseErrorCount = 0;
const originalConsoleError = console.error;

console.error = function (...args) {
  // Check for Firebase 400 errors
  const errorText = args.join(" ").toLowerCase();
  if (errorText.includes("firebase") && errorText.includes("400")) {
    firebaseErrorCount++;

    if (firebaseErrorCount > 10 && !EMERGENCY_DISABLE) {
      console.warn(
        "🚨 AUTO-ENABLING EMERGENCY MODE: Too many Firebase 400 errors detected",
      );
      console.warn(
        "🔧 Edit firebase-emergency-fix.js and set EMERGENCY_DISABLE = true",
      );
    }
  }

  // Call original console.error
  return originalConsoleError.apply(this, args);
};

// Status reporting
setInterval(() => {
  if (__emergencyVerbose && firebaseErrorCount > 0) {
    console.log(
      `📊 Firebase Error Count: ${firebaseErrorCount} (Emergency: ${EMERGENCY_DISABLE ? "ON" : "OFF"})`,
    );
  }
}, 30000); // Every 30 seconds

// Export for manual control
window.FirebaseEmergencyFix = {
  getErrorCount: () => firebaseErrorCount,
  resetErrorCount: () => {
    firebaseErrorCount = 0;
  },
  getStatus: () => ({
    emergencyDisable: EMERGENCY_DISABLE,
    errorCount: firebaseErrorCount,
    timestamp: new Date(),
  }),
};

if (__emergencyVerbose) {
  console.log("🔧 Firebase Emergency Fix Script Ready");
  console.log("📋 Use window.FirebaseEmergencyFix.getStatus() to check status");
}
