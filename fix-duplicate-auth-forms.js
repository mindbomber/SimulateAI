/**
 * Authentication DOM Cleanup and Duplicate ID Fix
 * Fixes the duplicate form ID issues in authentication modal
 */

// Add this to debug auth issues script to detect and fix duplicate IDs
function fixDuplicateAuthForms() {
  console.log("🔧 Checking for duplicate authentication form IDs...");

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

// Add this to the existing debugAuth object
window.debugAuth.fixDuplicateAuthForms = fixDuplicateAuthForms;

// Auto-run the fix
console.log("🔧 Running duplicate ID fix...");
fixDuplicateAuthForms();

console.log("💡 Function available: window.debugAuth.fixDuplicateAuthForms()");
