// Firebase Configuration for SimulateAI
// Clean configuration file - no corruption

export const firebaseConfig = {
  apiKey: 'AIzaSyB123example456789abcdef',
  authDomain: 'simulateai-research.firebaseapp.com',
  projectId: 'simulateai-research',
  storageBucket: 'simulateai-research.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef123456789',
  measurementId: 'G-ABCDEF1234',
};

// VAPID Key for Firebase Cloud Messaging Web Push
export const VAPID_KEY =
  'BAbcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef123456789abcdef123';

// reCAPTCHA v3 Configuration
export const recaptchaConfig = {
  siteKey: '6LfizIQrAAAAAETdjKY14uI3ckhF-JeUujcloH53',
  action: 'submit',
};

// Data Connect Configuration
export const dataConnectConfig = {
  connector: 'simulateai-connector',
  location: 'us-central1',
  service: 'simulateai-dataconnect',
};

// Storage Configuration
const BYTES_PER_KB = 1024;
const KB_PER_MB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * KB_PER_MB;
const MAX_FILE_SIZE_MB = 100;

export const storageConfig = {
  bucket: 'simulateai-research.appspot.com',
  maxFileSize: MAX_FILE_SIZE_MB * BYTES_PER_MB, // 100MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
  ],
};

// Analytics Configuration
export const analyticsConfig = {
  enablePerformanceMonitoring: true,
  enableDebugMode: false,
  enableAnalytics: true,
  customDimensions: {
    userType: 'custom_dimension_1',
    contentCategory: 'custom_dimension_2',
    aiProcessingType: 'custom_dimension_3',
  },
};

// App Check Configuration
export const appCheckConfig = {
  provider: 'reCAPTCHA',
  isTokenAutoRefreshEnabled: true,
};

// Note:
// For local development only, you can enable App Check debug mode without
// committing secrets by setting in the browser console before app init:
//   window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
// Or set a specific token via environment, but never commit it to source control.

// Cloud Messaging Configuration (for notifications)
export const messagingConfig = {
  vapidKey:
    'BKx1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
};

// Performance Monitoring Configuration
export const performanceConfig = {
  dataCollectionEnabled: true,
  instrumentationEnabled: true,
  samplingRate: 1.0, // 100% sampling for now, reduce in production
};

// Security Configuration
export const securityConfig = {
  enableAppCheck: true,
  enableSecurityRules: true,
  enableAuditLogging: true,
  maxRequestsPerMinute: 1000,
  enableRateLimiting: true,
};

// Development Configuration
export const devConfig = {
  enableDebugLogging:
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1',
  useEmulators: false, // Set to true for local development with emulators
  emulatorPorts: {
    auth: 9099,
    firestore: 8080,
    storage: 9199,
    functions: 5001,
  },
};

// Export all configurations
export default {
  firebaseConfig,
  recaptchaConfig,
  dataConnectConfig,
  storageConfig,
  analyticsConfig,
  appCheckConfig,
  messagingConfig,
  performanceConfig,
  securityConfig,
  devConfig,
};
