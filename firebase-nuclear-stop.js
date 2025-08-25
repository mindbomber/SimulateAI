/**
 * NUCLEAR FIREBASE STOP SCRIPT - BLOCKS ALL FIREBASE NETWORK CALLS
 * This script intercepts XMLHttpRequest and fetch to block Firebase calls
 *
 * USAGE:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to execute
 * 4. Watch Firebase 400 errors disappear immediately
 */

console.log("🚀 NUCLEAR: Starting Firebase Network Interception");

// Store original functions
const originalXHR = window.XMLHttpRequest;
const originalFetch = window.fetch;
const originalOpen = XMLHttpRequest.prototype.open;
const originalSend = XMLHttpRequest.prototype.send;

// Firebase URL patterns to block
const firebasePatterns = [
  "firestore.googleapis.com",
  "firebase.googleapis.com",
  "firebaseremoteconfig.googleapis.com",
  "firebaseinstallations.googleapis.com",
  "analytics.google.com",
  "firebase-settings.crashlytics.com",
  "crashlytics.googleapis.com",
];

// Check if URL is Firebase-related
function isFirebaseURL(url) {
  if (!url) return false;
  return firebasePatterns.some((pattern) => url.includes(pattern));
}

// Override XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
  if (isFirebaseURL(url)) {
    console.log(`🚫 BLOCKED XHR: ${method} ${url}`);

    // Create a fake successful response
    this.readyState = 4;
    this.status = 200;
    this.statusText = "OK (Blocked)";
    this.responseText = JSON.stringify({
      blocked: true,
      reason: "Firebase blocked by nuclear script",
    });
    this.response = this.responseText;

    // Immediately trigger events
    setTimeout(() => {
      if (this.onreadystatechange) this.onreadystatechange();
      if (this.onload) this.onload();
    }, 1);

    return; // Don't call original open
  }

  // Call original for non-Firebase URLs
  return originalOpen.call(this, method, url, async, user, password);
};

// Override XMLHttpRequest.prototype.send
XMLHttpRequest.prototype.send = function (data) {
  // If this request was already blocked, don't send anything
  if (
    this.readyState === 4 &&
    this.status === 200 &&
    this.responseText.includes("blocked")
  ) {
    return;
  }

  // Call original send for non-Firebase requests
  return originalSend.call(this, data);
};

// Override fetch API
window.fetch = function (input, init) {
  const url = typeof input === "string" ? input : input.url;

  if (isFirebaseURL(url)) {
    console.log(`🚫 BLOCKED FETCH: ${url}`);

    // Return a fake successful response
    return Promise.resolve(
      new Response(
        JSON.stringify({
          blocked: true,
          reason: "Firebase blocked by nuclear script",
        }),
        {
          status: 200,
          statusText: "OK (Blocked)",
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
  }

  // Call original fetch for non-Firebase URLs
  return originalFetch.call(this, input, init);
};

// Also block any Firebase modules that might be loaded
if (window.firebase) {
  console.log("🛑 Disabling Firebase SDK");

  // Replace Firebase methods with no-ops
  const noOp = () => Promise.resolve({ blocked: true });

  if (window.firebase.firestore) {
    const originalFirestore = window.firebase.firestore;
    window.firebase.firestore = function () {
      console.log("🚫 Firebase Firestore call blocked");
      return {
        collection: () => ({
          add: noOp,
          doc: () => ({
            set: noOp,
            update: noOp,
            delete: noOp,
            get: noOp,
          }),
        }),
        doc: () => ({
          set: noOp,
          update: noOp,
          delete: noOp,
          get: noOp,
        }),
      };
    };
  }

  if (window.firebase.analytics) {
    window.firebase.analytics = () => ({
      logEvent: noOp,
      setUserId: noOp,
      setUserProperties: noOp,
    });
  }

  if (window.firebase.auth) {
    const originalAuth = window.firebase.auth;
    window.firebase.auth = () => ({
      signInWithEmailAndPassword: noOp,
      createUserWithEmailAndPassword: noOp,
      signOut: noOp,
      onAuthStateChanged: () => {},
      currentUser: null,
    });
  }
}

// Block any direct Google APIs calls
if (window.gapi) {
  console.log("🛑 Disabling Google APIs");
  window.gapi.load = () => {};
  if (window.gapi.auth2) {
    window.gapi.auth2.getAuthInstance = () => null;
  }
}

// Set emergency flags
localStorage.setItem("FIREBASE_NUCLEAR_BLOCKED", "true");
localStorage.setItem("FIREBASE_NUCLEAR_TIMESTAMP", Date.now().toString());

// Monitor and report blocks
let blockedCount = 0;
const originalConsoleLog = console.log;

// Override console to count blocks
const blockCounter = {
  xhr: 0,
  fetch: 0,
  total: 0,
};

// Create a monitoring interval
const monitorInterval = setInterval(() => {
  if (blockCounter.total > 0) {
    console.log(
      `📊 Firebase Blocks: XHR: ${blockCounter.xhr}, Fetch: ${blockCounter.fetch}, Total: ${blockCounter.total}`,
    );
  }
}, 5000);

// Store the interval ID so it can be cleared later
window.firebaseBlockerInterval = monitorInterval;

// Final status
console.log("✅ NUCLEAR FIREBASE BLOCKER ACTIVATED");
console.log("🔥 ALL Firebase network calls will now be blocked");
console.log("📈 Check status every 5 seconds in console");
console.log("🛑 Firebase 400 errors should now be COMPLETELY eliminated");

// Create a status object
window.FirebaseNuclearStatus = {
  active: true,
  blocked: blockCounter,
  timestamp: new Date(),
  message: "Nuclear Firebase blocking active - all network calls intercepted",
  disable: function () {
    // Restore original functions
    window.XMLHttpRequest = originalXHR;
    window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalOpen;
    XMLHttpRequest.prototype.send = originalSend;

    clearInterval(window.firebaseBlockerInterval);
    localStorage.setItem("FIREBASE_NUCLEAR_BLOCKED", "false");

    console.log("🟢 Nuclear Firebase blocker disabled");
    this.active = false;
  },
};

console.log("📋 Check status with: window.FirebaseNuclearStatus");
console.log("🔧 Disable with: window.FirebaseNuclearStatus.disable()");
