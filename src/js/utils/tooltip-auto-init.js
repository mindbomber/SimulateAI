/**
 * Tooltip Auto-Initializer
 * Ensures category progress ring tooltips work automatically for all users
 * This provides a fallback initialization independent of component loading
 */

(function initializeTooltipsGlobally() {
  "use strict";

  console.log("🔧 Tooltip Auto-Initializer: Starting...");

  // Check if tooltips are already initialized
  if (window.tooltipsAutoInitialized) {
    console.log(
      "🔧 Tooltip Auto-Initializer: Already initialized, skipping...",
    );
    return;
  }

  // Mark as initialized
  window.tooltipsAutoInitialized = true;

  /**
   * Enhanced tooltip functionality for progress rings
   */
  function initializeProgressRingTooltips() {
    const rings = document.querySelectorAll(".category-progress-ring");
    let processedRings = 0;

    console.log(
      `🔧 Tooltip Auto-Initializer: Found ${rings.length} progress rings`,
    );

    rings.forEach((ring, index) => {
      // Skip if already processed
      if (ring.getAttribute("data-auto-tooltip") === "true") {
        return;
      }

      // Ensure tooltip data
      if (!ring.hasAttribute("data-tooltip")) {
        const percentage =
          ring.querySelector(".progress-percentage")?.textContent || "0%";
        const categoryTitle = ring
          .closest(".category-header")
          ?.querySelector(".category-title")?.textContent;
        const categoryId =
          ring.getAttribute("data-category-id") || `category-${index + 1}`;

        let tooltipContent = `Progress: ${percentage}`;
        if (categoryTitle) {
          tooltipContent = `${categoryTitle}: ${percentage} complete`;
        } else if (categoryId && categoryId !== `category-${index + 1}`) {
          tooltipContent = `${categoryId}: ${percentage} complete`;
        }

        ring.setAttribute("data-tooltip", tooltipContent);
      }

      // Ensure accessibility
      if (!ring.hasAttribute("role")) ring.setAttribute("role", "button");
      if (!ring.hasAttribute("tabindex")) ring.setAttribute("tabindex", "0");
      if (!ring.hasAttribute("aria-label")) {
        const tooltipContent = ring.getAttribute("data-tooltip");
        ring.setAttribute("aria-label", `Category progress: ${tooltipContent}`);
      }

      // Create tooltip functions
      const createTooltip = (content, rect) => {
        // Remove existing tooltips
        document.querySelectorAll(".auto-tooltip").forEach((el) => el.remove());

        const tooltip = document.createElement("div");
        tooltip.className = "progress-ring-tooltip visible auto-tooltip";
        tooltip.textContent = content;
        tooltip.style.cssText = `
          position: fixed !important;
          top: ${rect.top - 50}px !important;
          left: ${rect.left + rect.width / 2}px !important;
          transform: translateX(-50%) !important;
          z-index: 1300 !important;
          background: #1f2937 !important;
          color: white !important;
          padding: 12px 16px !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          opacity: 1 !important;
          display: block !important;
          visibility: visible !important;
          max-width: 300px !important;
          min-width: 200px !important;
          text-align: center !important;
          line-height: 1.5 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
          border: 1px solid #374151 !important;
          pointer-events: none !important;
        `;

        if (rect.top - 50 < 0) {
          tooltip.style.top = `${rect.bottom + 8}px !important`;
        }

        document.body.appendChild(tooltip);
        return tooltip;
      };

      const showTooltip = () => {
        const rect = ring.getBoundingClientRect();
        const content = ring.getAttribute("data-tooltip");
        const tooltip = createTooltip(content, rect);
        ring._autoTooltip = tooltip;
      };

      const hideTooltip = () => {
        if (ring._autoTooltip) {
          ring._autoTooltip.remove();
          ring._autoTooltip = null;
        }
        document.querySelectorAll(".auto-tooltip").forEach((el) => el.remove());
      };

      // Attach event listeners
      ring.addEventListener("mouseenter", showTooltip);
      ring.addEventListener("mouseleave", hideTooltip);
      ring.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          showTooltip();
          setTimeout(hideTooltip, 3000);
        },
        { passive: false },
      );
      ring.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if ("ontouchstart" in window) {
          if (ring._autoTooltip) {
            hideTooltip();
          } else {
            showTooltip();
            setTimeout(hideTooltip, 3000);
          }
        }
      });
      ring.addEventListener("keydown", (e) => {
        if (["Enter", " ", "Escape"].includes(e.key)) {
          e.preventDefault();
          if (e.key === "Escape") {
            hideTooltip();
          } else {
            showTooltip();
            setTimeout(hideTooltip, 3000);
          }
        }
      });

      // Mark as processed
      ring.setAttribute("data-auto-tooltip", "true");
      processedRings++;
    });

    console.log(
      `🔧 Tooltip Auto-Initializer: Processed ${processedRings} rings`,
    );
  }

  /**
   * Set up monitoring for new rings and view changes
   */
  function setupMonitoring() {
    // Monitor for view changes
    const observer = new MutationObserver((mutations) => {
      let shouldReinitialize = false;

      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-view"
        ) {
          shouldReinitialize = true;
        } else if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.classList?.contains("category-progress-ring") ||
                node.querySelectorAll?.(".category-progress-ring").length > 0
              ) {
                shouldReinitialize = true;
              }
            }
          });
        }
      });

      if (shouldReinitialize) {
        setTimeout(initializeProgressRingTooltips, 500);
      }
    });

    // Observe the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-view"],
    });

    // Periodic check for new rings
    setInterval(() => {
      const unprocessedRings = document.querySelectorAll(
        '.category-progress-ring:not([data-auto-tooltip="true"])',
      );
      if (unprocessedRings.length > 0) {
        console.log(
          `🔧 Tooltip Auto-Initializer: Found ${unprocessedRings.length} new rings`,
        );
        initializeProgressRingTooltips();
      }
    }, 3000);
  }

  // Initialize when DOM is ready
  function initialize() {
    initializeProgressRingTooltips();
    setupMonitoring();

    // Global function for manual reinitialization
    window.reinitializeTooltips = initializeProgressRingTooltips;

    console.log("🔧 Tooltip Auto-Initializer: Initialization complete");
  }

  // Start initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
