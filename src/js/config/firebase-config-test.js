/**
 * Firebase Configuration Test
 * Quick verification that Firebase is properly configured
 */

// Test Firebase configuration
console.log("🔥 Testing Firebase Configuration...");

// Import the config
import { firebaseConfig } from "./firebase-config.js";

// Verify all required fields are present
const requiredFields = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

let configValid = true;
const results = {};

requiredFields.forEach((field) => {
  const value = firebaseConfig[field];
  const isValid =
    value &&
    value !== `YOUR_${field.toUpperCase()}` &&
    !value.includes("YOUR_");
  results[field] = { value, isValid };

  if (!isValid) {
    configValid = false;
  }

  console.log(`${isValid ? "✅" : "❌"} ${field}: ${value}`);
});

// Check optional fields
const optionalFields = ["measurementId"];
optionalFields.forEach((field) => {
  const value = firebaseConfig[field];
  const isValid =
    value &&
    value !== `YOUR_${field.toUpperCase()}` &&
    !value.includes("YOUR_");
  results[field] = { value, isValid, optional: true };

  console.log(
    `${isValid ? "✅" : "⚠️"} ${field}: ${value} ${isValid ? "" : "(optional)"}`,
  );
});

// Project-specific validations
const projectValidations = [
  {
    name: "Project ID matches",
    valid: firebaseConfig.projectId === "simulateai-research",
    message: `Project ID: ${firebaseConfig.projectId}`,
  },
  {
    name: "Messaging Sender ID matches",
    valid: firebaseConfig.messagingSenderId === "52924445915",
    message: `Messaging Sender ID: ${firebaseConfig.messagingSenderId}`,
  },
  {
    name: "Auth Domain format",
    valid: firebaseConfig.authDomain === "simulateai-research.firebaseapp.com",
    message: `Auth Domain: ${firebaseConfig.authDomain}`,
  },
  {
    name: "Storage Bucket format",
    valid:
      firebaseConfig.storageBucket ===
      "simulateai-research.firebasestorage.app",
    message: `Storage Bucket: ${firebaseConfig.storageBucket}`,
  },
];

console.log("\n🎯 Project-specific validations:");
projectValidations.forEach((validation) => {
  console.log(
    `${validation.valid ? "✅" : "❌"} ${validation.name}: ${validation.message}`,
  );
  if (!validation.valid) configValid = false;
});

// Final result
console.log(`\n${"=".repeat(50)}`);
if (configValid) {
  console.log("🎉 Firebase configuration is VALID and ready for use!");
  console.log("Next step: Generate VAPID key for push notifications");
} else {
  console.log("❌ Firebase configuration has issues that need to be fixed");
}
console.log("=".repeat(50));

// Export results for other scripts
export { results, configValid };
