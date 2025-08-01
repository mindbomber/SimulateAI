/**
 * IMMEDIATE FIREBASE 400 ERROR STOP SCRIPT
 * Run this in browser console to immediately stop Firebase errors
 *
 * INSTRUCTIONS:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to execute
 * 4. Refresh the page
 */

console.log("🚨 EMERGENCY: Immediate Firebase Error Stop Script");

// Emergency disable all Firebase operations
if (typeof window !== "undefined") {
  // Block PWA Service Firebase calls
  if (window.app && window.app.pwaService) {
    console.log("🛑 Disabling PWA Service Firebase tracking");
    window.app.pwaService.trackPWAEvent = function () {
      console.log("🚫 PWA Event blocked by emergency script");
      return Promise.resolve({ blocked: true });
    };
  }

  // Block Firebase Analytics Service
  if (window.app && window.app.firebaseService) {
    console.log("🛑 Disabling Firebase Service operations");

    // Block analytics tracking
    const originalTrackEvent = window.app.firebaseService.trackEvent;
    window.app.firebaseService.trackEvent = function () {
      console.log("🚫 Firebase Event blocked by emergency script");
      return Promise.resolve({ blocked: true });
    };

    // Block storage events
    const originalTrackStorageEvent =
      window.app.firebaseService.trackStorageEvent;
    window.app.firebaseService.trackStorageEvent = function () {
      console.log("🚫 Firebase Storage Event blocked by emergency script");
      return Promise.resolve({ blocked: true });
    };

    // Block error tracking
    const originalTrackError = window.app.firebaseService.trackError;
    window.app.firebaseService.trackError = function () {
      console.log("🚫 Firebase Error tracking blocked by emergency script");
      return Promise.resolve({ blocked: true });
    };
  }

  // Block any remaining Firebase calls
  if (window.firebase) {
    console.log("🛑 Patching global Firebase object");
    // Prevent new Firebase operations
    const originalFirestore = window.firebase.firestore;
    window.firebase.firestore = function () {
      console.log("🚫 Firebase Firestore access blocked by emergency script");
      return {
        collection: () => ({
          add: () => Promise.resolve({ blocked: true }),
          doc: () => ({
            set: () => Promise.resolve({ blocked: true }),
            update: () => Promise.resolve({ blocked: true }),
            delete: () => Promise.resolve({ blocked: true }),
          }),
        }),
      };
    };
  }

  // Set emergency flag in localStorage
  localStorage.setItem("FIREBASE_EMERGENCY_DISABLED", "true");
  localStorage.setItem("FIREBASE_EMERGENCY_TIMESTAMP", Date.now().toString());

  console.log("✅ Emergency Firebase blocking activated");
  console.log("🔄 Please refresh the page to see reduced errors");
  console.log("📊 Firebase 400 errors should now be significantly reduced");

  // Show status
  window.FirebaseEmergencyStatus = {
    disabled: true,
    timestamp: new Date(),
    message: "Firebase operations blocked by emergency script",
  };

  console.log("📋 Check status with: window.FirebaseEmergencyStatus");
}
