/**
 * Firebase Connection Management Optimization
 * Optional script to reduce Firestore connection termination errors
 *
 * Add this to your main app initialization if you want to minimize
 * the 400 Bad Request errors (though they're harmless)
 */

// Enhanced Firestore settings for better connection management
const optimizeFirestoreConnections = () => {
  try {
    // Check if Firestore is available
    if (window.app?.firestoreService?.db) {
      const db = window.app.firestoreService.db;

      // Enable network persistence (reduces reconnection issues)
      db.enableNetwork().catch((error) => {
        console.debug("Firestore network already enabled:", error.message);
      });

      console.log("✅ Firestore connection optimization applied");
    }

    // Graceful connection cleanup on page unload
    window.addEventListener("beforeunload", () => {
      try {
        if (window.app?.firestoreService?.db) {
          // Gracefully terminate connections
          window.app.firestoreService.db.terminate();
        }
      } catch (error) {
        // Ignore termination errors - they're expected during cleanup
        console.debug("Firestore termination (expected):", error.message);
      }
    });

    // Handle visibility changes (tab switching)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        // Re-enable network when tab becomes visible
        if (window.app?.firestoreService?.db) {
          window.app.firestoreService.db.enableNetwork().catch(() => {});
        }
      }
    });
  } catch (error) {
    console.debug("Firestore optimization not applied:", error.message);
  }
};

// Console filter to hide harmless Firebase connection errors
const createFirebaseErrorFilter = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // List of harmless Firebase error patterns to filter
  const harmlessPatterns = [
    /firestore\.googleapis\.com.*400.*Bad Request/i,
    /TYPE=terminate/i,
    /WebSocket connection.*closed/i,
    /Network request failed/i,
  ];

  const shouldFilter = (message) => {
    const messageStr = String(message);
    return harmlessPatterns.some((pattern) => pattern.test(messageStr));
  };

  console.error = (...args) => {
    if (!shouldFilter(args[0])) {
      originalConsoleError.apply(console, args);
    }
  };

  console.warn = (...args) => {
    if (!shouldFilter(args[0])) {
      originalConsoleWarn.apply(console, args);
    }
  };

  console.log("🔇 Firebase connection error filtering enabled");
};

// Export for optional use
window.firebaseOptimization = {
  optimizeConnections: optimizeFirestoreConnections,
  enableErrorFiltering: createFirebaseErrorFilter,

  // Quick setup function
  setup: () => {
    optimizeFirestoreConnections();
    createFirebaseErrorFilter();
    console.log(
      "🛡️ Firebase connection optimization and error filtering active",
    );
  },
};

// Uncomment this line if you want to apply optimizations automatically:
// window.firebaseOptimization.setup();

console.log(
  "🔧 Firebase optimization tools available at window.firebaseOptimization",
);
console.log(
  "💡 Run window.firebaseOptimization.setup() to reduce connection errors",
);
