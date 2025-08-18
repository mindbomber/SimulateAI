// Development Firebase Configuration
// DEVELOPMENT ONLY - Safe placeholder values for localhost testing
// Real credentials are automatically injected by Firebase Hosting in production

export const firebaseConfig = {
  apiKey: "dev-placeholder-api-key",
  authDomain: "simulateai-research.firebaseapp.com",
  databaseURL: "https://simulateai-research-default-rtdb.firebaseio.com",
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
  useEmulators: true, // 🔥 ENABLED for emulator development
  // Force popup auth in dev to avoid redirect handler issues on small windows
  forcePopupAuth: true,
  emulatorHost: "127.0.0.1",
  emulatorPorts: {
    auth: 9099,
    firestore: 8081,
    storage: 9199,
    functions: 5001,
    database: 9000,
  },
};

// Development note (logs removed to reduce console noise)

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
