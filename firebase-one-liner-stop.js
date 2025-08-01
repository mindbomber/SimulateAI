/**
 * ONE-LINER FIREBASE BLOCKER - Copy and paste this into console
 *
 * INSTRUCTIONS:
 * 1. Copy the line below (starts with "window.fetch =")
 * 2. Paste into browser console
 * 3. Press Enter
 * 4. Firebase 400 errors stop immediately
 */

// ONE-LINER VERSION - COPY THIS ENTIRE LINE:
window.fetch = new Proxy(window.fetch, {
  apply: (target, thisArg, args) => {
    const url = args[0]?.url || args[0];
    if (
      url &&
      (url.includes("firestore.googleapis.com") || url.includes("firebase"))
    ) {
      console.log("🚫 BLOCKED:", url);
      return Promise.resolve(new Response('{"blocked":true}', { status: 200 }));
    }
    return target.apply(thisArg, args);
  },
});
XMLHttpRequest.prototype.open = new Proxy(XMLHttpRequest.prototype.open, {
  apply: (target, thisArg, args) => {
    if (
      args[1] &&
      (args[1].includes("firestore.googleapis.com") ||
        args[1].includes("firebase"))
    ) {
      console.log("🚫 BLOCKED XHR:", args[1]);
      thisArg.readyState = 4;
      thisArg.status = 200;
      thisArg.responseText = '{"blocked":true}';
      setTimeout(() => {
        if (thisArg.onreadystatechange) thisArg.onreadystatechange();
        if (thisArg.onload) thisArg.onload();
      }, 1);
      return;
    }
    return target.apply(thisArg, args);
  },
});
console.log("✅ Firebase blocker active - 400 errors will now stop");

// ALTERNATIVE: If the above doesn't work, try this simpler version:
// window.fetch = () => Promise.resolve(new Response('{"blocked":true}', {status: 200})); console.log('✅ ALL FETCH BLOCKED');

/**
 * RESTORE NORMAL OPERATION:
 * location.reload(); // Refresh the page to restore normal Firebase operation
 */
