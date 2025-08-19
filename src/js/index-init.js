// Minimal landing page initializer to avoid importing the full app bundle/CSS
// - No CSS imports here; index.html keeps its own inline styles
// - Only attach trivial behavior needed for the hero/CTA

import logger from "./utils/logger.js";

(function initLanding() {
  try {
    // Example: smooth scroll for CTA buttons if anchors exist
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // Optional: set a class to indicate JS is active
    document.documentElement.classList.add("js-enabled");
    logger?.info?.("IndexInit", "Landing page initialized");
  } catch (err) {
    try {
      logger?.warn?.("IndexInit", "Initialization error", err);
    } catch (ignore) {
      // Intentionally ignore logging failures
    }
  }
})();
