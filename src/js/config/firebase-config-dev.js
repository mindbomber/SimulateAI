// Development Firebase Configuration
// DEVELOPMENT ONLY - Safe placeholder values for localhost testing
// Real credentials are automatically injected by Firebase Hosting in production

export const firebaseConfig = {
  apiKey: "dev-placeholder-api-key",
  authDomain: "simulateai-research.firebaseapp.com",
  projectId: "simulateai-research",
  storageBucket: "simulateai-research.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:dev-app-id",
  measurementId: "G-DEV-MEASUREMENT",
};

// VAPID Key for development (placeholder)
export const VAPID_KEY = "dev-vapid-key-placeholder";

// reCAPTCHA Enterprise Configuration (development)
export const recaptchaConfig = {
  siteKey: "6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf", // Production Enterprise key for development testing
  action: "submit",
};

// Analytics Configuration
export const analyticsConfig = {
  enablePerformanceMonitoring: false,
  enableDebugMode: true,
  enableAnalytics: false,
  customDimensions: {
    userType: "custom_dimension_1",
    contentCategory: "custom_dimension_2",
    aiProcessingType: "custom_dimension_3",
  },
};

// Cloud Messaging Configuration (for notifications)
export const messagingConfig = {
  vapidKey: "dev-vapid-key-placeholder",
};

// Performance Monitoring Configuration
export const performanceConfig = {
  dataCollectionEnabled: false,
  instrumentationEnabled: false,
  samplingRate: 0.1,
};

// Security Configuration
export const securityConfig = {
  enableAppCheck: false,
  enableSecurityRules: false,
  enableAuditLogging: false,
  maxRequestsPerMinute: 100,
  enableRateLimiting: false,
};

// Development Configuration
export const devConfig = {
  enableDebugLogging: true,
  useEmulators: false,
  emulatorPorts: {
    auth: 9099,
    firestore: 8080,
    storage: 9199,
    functions: 5001,
  },
};

// Development note
console.log("🔧 Using development Firebase configuration");
console.log("⚠️ This config contains placeholder values for localhost only");
console.log(
  "🚀 Production will use secure config injection from Firebase Hosting",
);

// Export default config
export default {
  firebaseConfig,
  VAPID_KEY,
  recaptchaConfig,
  analyticsConfig,
  messagingConfig,
  performanceConfig,
  securityConfig,
  devConfig,
};
