// Firebase Secure Config Loader for Production Deployment
// Uses Firebase Hosting's automatic config injection

import { initializeApp } from "firebase/app";

/**
 * Initialize Firebase securely using Firebase Hosting's automatic config injection
 * This method keeps your real credentials secure and never exposes them in static files
 * @returns {Promise<FirebaseApp>} Initialized Firebase app instance
 */
export async function initializeFirebaseSecurely() {
  try {
    // Firebase Hosting automatically provides config at this endpoint
    const response = await fetch("/__/firebase/init.json");

    if (!response.ok) {
      throw new Error(`Config fetch failed: ${response.status}`);
    }

    const firebaseConfig = await response.json();

    console.log("🔥 Firebase config loaded securely from hosting");
    console.log("✅ Project:", firebaseConfig.projectId);

    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error("❌ Failed to load Firebase config from hosting:", error);

    // Fallback for development (localhost only)
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      console.log("🔧 Using development fallback config");

      try {
        const devConfig = await import("./firebase-config-dev.js");
        return initializeApp(devConfig.firebaseConfig);
      } catch (devError) {
        console.error("❌ Development config also failed:", devError);
        throw new Error("No Firebase configuration available for development");
      }
    }

    throw new Error(
      "Firebase configuration not available - ensure app is deployed to Firebase Hosting",
    );
  }
}

/**
 * Get Firebase configuration object (for advanced usage)
 * @returns {Promise<Object>} Firebase configuration object
 */
export async function getFirebaseConfig() {
  try {
    const response = await fetch("/__/firebase/init.json");

    if (!response.ok) {
      throw new Error(`Config fetch failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Failed to get Firebase config:", error);

    // Development fallback
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      const devConfig = await import("./firebase-config-dev.js");
      return devConfig.firebaseConfig;
    }

    throw error;
  }
}

/**
 * Check if Firebase config is available
 * @returns {Promise<boolean>} True if config is available
 */
export async function isFirebaseConfigAvailable() {
  try {
    await getFirebaseConfig();
    return true;
  } catch {
    return false;
  }
}

export default initializeFirebaseSecurely;
