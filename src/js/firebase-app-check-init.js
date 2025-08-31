/**
 * Direcconst firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};e App Check Initialization for SimulateAI
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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, // Your project ID!
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
      "6LfizIQrAAAAAETdjKY14uI3ckhF-JeUujcloH53",
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
