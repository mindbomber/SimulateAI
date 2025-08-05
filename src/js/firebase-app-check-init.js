/**
 * Direct Firebase App Check Initialization for SimulateAI
 * This follows the exact Firebase documentation pattern
 */

// Import the necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAwoc3L-43aXyNjNB9ncGbFm7eE-yn5bFA",
  authDomain: "simulateai-research.firebaseapp.com",
  projectId: "simulateai-research", // Your project ID!
  storageBucket: "simulateai-research.firebasestorage.app",
  messagingSenderId: "52924445915",
  appId: "1:52924445915:web:dadca1a93bc382403a08fe",
  measurementId: "G-XW8H062BMV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check variable
let appCheck = null;

// Initialize App Check
// Replace 'YOUR_RECAPTCHA_V3_SITE_KEY' with your actual reCAPTCHA v3 site key
// You can set `isDebug: true` for local development if you registered a debug token in the console.
if (typeof self !== "undefined") {
  // Check if running in a browser environment
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      "6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf",
    ),
    // Optional: enable debug mode locally
    isTokenAutoRefreshEnabled: true,
    // Uncomment for local development:
    // isDebug: window.location.hostname === 'localhost'
  });
}

// Export the initialized app and app check for use in other modules
export { app };

// Optional: Export a function to get App Check tokens
export async function getAppCheckToken() {
  try {
    const { getToken } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js"
    );
    const appCheckTokenResponse = await getToken(appCheck);
    return appCheckTokenResponse.token;
  } catch (error) {
    console.error("Failed to get App Check token:", error);
    throw error;
  }
}

// Optional: Validate App Check status
export function isAppCheckReady() {
  return typeof appCheck !== "undefined" && appCheck !== null;
}

/**
 * Usage examples:
 *
 * // Import in other files:
 * import { app, getAppCheckToken, isAppCheckReady } from './firebase-app-check-init.js';
 *
 * // Use Firebase services with App Check protection:
 * import { getFirestore } from 'firebase/firestore';
 * const db = getFirestore(app);
 *
 * // Get App Check token for API calls:
 * const token = await getAppCheckToken();
 *
 * // Check if App Check is working:
 * if (isAppCheckReady()) {
 *
 * }
 */
