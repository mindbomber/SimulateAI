/**
 * Debug Script for Google OAuth Authentication Issues
 * Run this in the browser console to diagnose authentication problems
 */

console.log("🔍 Starting Google OAuth Debug Analysis...");

// 1. Check Firebase Configuration
function checkFirebaseConfig() {
  console.log("1️⃣ Checking Firebase Configuration...");

  if (typeof firebase === "undefined" && typeof window.app === "undefined") {
    console.error("❌ Firebase not loaded or app not initialized");
    return false;
  }

  const firebaseService = window.app?.firebaseService;
  if (!firebaseService) {
    console.error("❌ Firebase service not available");
    return false;
  }

  console.log("✅ Firebase service available");
  console.log("📄 Project ID:", firebaseService.app?.options?.projectId);
  console.log("🌐 Auth Domain:", firebaseService.app?.options?.authDomain);

  return true;
}

// 2. Check Domain Authorization
function checkDomainAuth() {
  console.log("\n2️⃣ Checking Domain Authorization...");

  const currentDomain = window.location.hostname;
  const currentOrigin = window.location.origin;

  console.log("🌐 Current domain:", currentDomain);
  console.log("🔗 Current origin:", currentOrigin);

  // Expected authorized domains
  const expectedDomains = [
    "simulateai.io",
    "www.simulateai.io",
    "localhost",
    "127.0.0.1",
  ];

  console.log("📋 Expected authorized domains:", expectedDomains);

  if (!expectedDomains.includes(currentDomain)) {
    console.warn("⚠️ Current domain may not be authorized:", currentDomain);
  } else {
    console.log("✅ Current domain should be authorized");
  }
}

// 3. Test Google Auth Provider
async function testGoogleAuthProvider() {
  console.log("\n3️⃣ Testing Google Auth Provider...");

  try {
    const authService = window.app?.authService;
    if (!authService) {
      console.error("❌ Auth service not available");
      return false;
    }

    console.log("✅ Auth service available");

    // Check if user is already signed in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      console.log("👤 User already signed in:", currentUser.email);
      return true;
    }

    console.log("👤 No user currently signed in");
    console.log("🔧 Ready to test Google sign-in");

    return true;
  } catch (error) {
    console.error("❌ Error testing auth provider:", error);
    return false;
  }
}

// 4. Check for Common Issues
function checkCommonIssues() {
  console.log("\n4️⃣ Checking for Common Issues...");

  // Check popup blockers
  console.log("🚫 Popup blocker test...");
  try {
    const testWindow = window.open("", "_blank", "width=1,height=1");
    if (testWindow) {
      testWindow.close();
      console.log("✅ Popups appear to be allowed");
    } else {
      console.warn("⚠️ Popups may be blocked");
    }
  } catch (error) {
    console.warn("⚠️ Popup test failed:", error.message);
  }

  // Check HTTPS
  console.log("🔒 HTTPS check...");
  if (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost"
  ) {
    console.log("✅ Using secure connection or localhost");
  } else {
    console.warn("⚠️ Using insecure connection - OAuth may fail");
  }

  // Check third-party cookies
  console.log("🍪 Third-party cookies check...");
  if (navigator.cookieEnabled) {
    console.log("✅ Cookies enabled");
  } else {
    console.warn("⚠️ Cookies disabled - OAuth will fail");
  }
}

// 5. Provide Troubleshooting Steps
function provideTroubleshootingSteps() {
  console.log("\n5️⃣ Troubleshooting Steps:");
  console.log(`
🔧 If authentication fails, check:

1. Firebase Console (https://console.firebase.google.com/project/simulateai-research/authentication/settings):
   - Verify authorized domains include: ${window.location.hostname}
   - Ensure Google provider is enabled

2. Google Cloud Console (https://console.cloud.google.com/apis/credentials?project=simulateai-research):
   - Check OAuth 2.0 Client ID configuration
   - Verify authorized JavaScript origins include: ${window.location.origin}
   - Verify authorized redirect URIs include: ${window.location.origin}/__/auth/handler

3. reCAPTCHA Enterprise Console (https://console.cloud.google.com/security/recaptcha?project=simulateai-research):
   - Verify site key 6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf includes domain: ${window.location.hostname}
   - Ensure reCAPTCHA Enterprise is enabled

4. Browser Settings:
   - Allow popups for ${window.location.hostname}
   - Enable third-party cookies
   - Disable aggressive ad blockers

4. Network Issues:
   - Check internet connection
   - Verify no corporate firewall blocking Firebase/Google domains
   - Try different network if issues persist

5. Clear Cache:
   - Clear browser cache and cookies
   - Try incognito/private browsing mode
  `);
}

// Run all checks
async function runFullDiagnostic() {
  console.log("🚀 Running Full Google OAuth Diagnostic...\n");

  const configOK = checkFirebaseConfig();
  checkDomainAuth();

  if (configOK) {
    await testGoogleAuthProvider();
  }

  checkCommonIssues();
  provideTroubleshootingSteps();

  console.log(
    "\n✅ Diagnostic complete! Check the output above for any issues.",
  );
}

// Auto-run diagnostic
runFullDiagnostic();

// 6. Test Google Sign-In Flow
async function testGoogleSignIn() {
  console.log("\n6️⃣ Testing Google Sign-In Flow...");

  try {
    const authService = window.app?.authService;
    if (!authService) {
      console.error("❌ Auth service not available");
      return false;
    }

    console.log("🔐 Attempting Google sign-in...");
    console.log("📝 This will open a popup window for authentication");

    const result = await authService.signInWithGoogle();

    if (result && result.user) {
      console.log("✅ Google sign-in successful!");
      console.log("👤 User:", result.user.email);
      console.log("🆔 UID:", result.user.uid);
      console.log("📸 Photo:", result.user.photoURL);
      return true;
    } else {
      console.warn("⚠️ Sign-in completed but no user data returned");
      return false;
    }
  } catch (error) {
    console.error("❌ Google sign-in failed:", error);
    console.error("🔍 Error code:", error.code);
    console.error("📝 Error message:", error.message);

    // Provide specific error guidance
    if (error.code === "auth/popup-blocked") {
      console.log("💡 Solution: Allow popups for this site");
    } else if (error.code === "auth/popup-closed-by-user") {
      console.log("💡 User closed the popup - try again");
    } else if (error.code === "auth/network-request-failed") {
      console.log("💡 Network issue - check internet connection");
    } else if (error.code === "auth/unauthorized-domain") {
      console.log("💡 Domain not authorized - check Firebase console");
    }

    return false;
  }
}

// 7. Test Sign-Out Flow
async function testSignOut() {
  console.log("\n7️⃣ Testing Sign-Out Flow...");

  try {
    const authService = window.app?.authService;
    if (!authService) {
      console.error("❌ Auth service not available");
      return false;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.log("ℹ️ No user currently signed in");
      return true;
    }

    console.log("🚪 Signing out user:", currentUser.email);
    await authService.signOut();

    console.log("✅ Sign-out successful!");
    return true;
  } catch (error) {
    console.error("❌ Sign-out failed:", error);
    return false;
  }
}

// 8. Fix Duplicate Form IDs
function fixDuplicateAuthForms() {
  console.log("\n8️⃣ Checking for duplicate authentication form IDs...");

  const duplicateIds = [
    "email-signin-form",
    "email-signup-form",
    "signin-email",
    "signin-password",
    "signup-email",
    "signup-name",
    "signup-password",
    "signup-confirm",
    "forgot-password-btn",
  ];

  let duplicatesFound = 0;

  duplicateIds.forEach((id) => {
    const elements = document.querySelectorAll(`#${id}`);
    if (elements.length > 1) {
      console.warn(`⚠️ Found ${elements.length} elements with ID "${id}"`);
      duplicatesFound++;

      // Remove all but the first element
      for (let i = 1; i < elements.length; i++) {
        console.log(`🗑️ Removing duplicate element #${id} (${i + 1})`);
        elements[i].remove();
      }
    }
  });

  if (duplicatesFound === 0) {
    console.log("✅ No duplicate form IDs found");
  } else {
    console.log(`🔧 Fixed ${duplicatesFound} duplicate ID issues`);
  }

  return duplicatesFound;
}

// Make functions available for manual testing
window.debugAuth = {
  checkFirebaseConfig,
  checkDomainAuth,
  testGoogleAuthProvider,
  checkCommonIssues,
  provideTroubleshootingSteps,
  runFullDiagnostic,
  testGoogleSignIn,
  testSignOut,
  fixDuplicateAuthForms,
};

console.log("\n🛠️ Debug functions available at window.debugAuth");
console.log("🔧 To test sign-in: window.debugAuth.testGoogleSignIn()");
console.log("🚪 To test sign-out: window.debugAuth.testSignOut()");
console.log(
  "🔧 To fix duplicate forms: window.debugAuth.fixDuplicateAuthForms()",
);
