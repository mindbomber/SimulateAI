/**
 * Dev-only CSS Layers Diagnostic
 * Lightweight helper to confirm CSS is being applied in development.
 * Safe no-op in production since it's not imported there.
 */

(() => {
  try {
    const h = location.hostname;
    const isDevHost =
      ["localhost", "127.0.0.1", "::1"].includes(h) ||
      h.startsWith("192.168.") ||
      h.endsWith(".local");

    const debugFlag =
      localStorage.getItem("debug") === "true" ||
      sessionStorage.getItem("debug") === "true";

    if (!isDevHost && !debugFlag) return;

    // Simple signal for developers
    // Avoid heavy stylesheet inspection for performance.
    // If needed, toggle verbose mode via `sessionStorage.debug = "true"`.
    const verbose = debugFlag;

    const applied = Array.from(document.styleSheets || []).length;
    if (verbose) {
      console.debug("[SimulateAI][CSS] Stylesheets attached:", applied);
    }

    // Add a tiny non-intrusive marker attribute on <html> for quick visual checks in DevTools
    document.documentElement.setAttribute(
      "data-css-diagnostic",
      String(applied),
    );
  } catch (_) {
    // no-op
  }
})();

export {}; // ESM hint
