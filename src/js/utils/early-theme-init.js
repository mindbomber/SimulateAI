/**
 * Early Theme Initialization
 * Prevents Flash of Unstyled Content (FOUC) by applying theme immediately
 *
 * This script should be loaded in <head> before other stylesheets and scripts
 * to ensure theme is applied as early as possible.
 */

(function () {
  "use strict";

  // Early theme application to prevent FOUC
  function applyEarlyTheme() {
    const storedTheme = localStorage.getItem("simulateai_theme_preference");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const body = document.body || document.documentElement;

    // Remove any existing theme classes
    body.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-system",
      "dark-mode",
    );

    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      // User has made an explicit choice
      body.classList.add(`theme-${storedTheme}`);

      if (storedTheme === "dark") {
        body.classList.add("dark-mode");
      } else if (storedTheme === "system") {
        body.classList.toggle("dark-mode", systemPrefersDark);
      }
      // light mode needs no dark-mode class
    } else {
      // No stored preference - follow system preference
      body.classList.add("theme-system");
      body.classList.toggle("dark-mode", systemPrefersDark);
    }
  }

  // Apply theme immediately if DOM is ready
  if (document.body) {
    applyEarlyTheme();
  } else {
    // Wait for body to be available
    document.addEventListener("DOMContentLoaded", applyEarlyTheme);
  }

  // Listen for system preference changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", function (e) {
    const storedTheme = localStorage.getItem("simulateai_theme_preference");

    // Only respond to system changes if user hasn't made explicit choice or chose system
    if (!storedTheme || storedTheme === "system") {
      const body = document.body || document.documentElement;
      body.classList.toggle("dark-mode", e.matches);
    }
  });

  // Export for potential use by other scripts
  window.EarlyThemeInit = {
    applyTheme: applyEarlyTheme,
    systemPrefersDark: function () {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
  };
})();
