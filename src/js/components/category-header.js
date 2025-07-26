/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Category Header Component
 * Displays category information with progress ring and metadata
 * Extracted from CategoryGrid for better modularity
 */

import badgeManager from "../core/badge-manager.js";
import logger from "../utils/logger.js";
import {
  loadCategoryHeaderConfig,
  getProgressRingConfig,
  getTooltipConfig,
  getHtmlTemplates,
  getStylingConfig,
  getEventsConfig,
  getSelectors,
  getAttributes,
  getBadgeConfig,
  calculateProgressOffset,
  generateTooltipContent,
  getCategorySelector,
  createProgressRingStyles,
  validateCategoryHeaderConfig,
} from "../utils/category-header-config-loader.js";

class CategoryHeader {
  static config = null;

  /**
   * Load configuration once for all instances
   */
  static async loadConfiguration() {
    if (!CategoryHeader.config) {
      try {
        CategoryHeader.config = await loadCategoryHeaderConfig();
        validateCategoryHeaderConfig(CategoryHeader.config);
        logger.info("CategoryHeader", "Configuration loaded and validated");
      } catch (error) {
        logger.error("CategoryHeader", "Failed to load configuration", error);
        throw error;
      }
    }
    return CategoryHeader.config;
  }

  constructor() {
    this.boundEvents = new Map();
    this.mutationObserver = null;

    // Automatically initialize tooltips when DOM is ready
    this.initializeAutomaticTooltips();
  }

  /**
   * Initialize automatic tooltip functionality for all users
   * This runs without manual intervention
   */
  initializeAutomaticTooltips() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.setupGlobalTooltipMonitoring();
      });
    } else {
      this.setupGlobalTooltipMonitoring();
    }
  }

  /**
   * Set up global monitoring for progress rings and tooltips
   * This ensures tooltips work automatically for all users
   */
  async setupGlobalTooltipMonitoring() {
    logger.info("CategoryHeader: Setting up global tooltip monitoring...");

    try {
      // Initial tooltip attachment
      await this.performGlobalTooltipAttachment();

      // Set up view change monitoring
      this.setupViewChangeMonitoring();

      // Set up periodic checks for new rings
      this.setupPeriodicTooltipChecks();

      logger.info("CategoryHeader: Global tooltip monitoring setup complete");
    } catch (error) {
      logger.error(
        "CategoryHeader: Error setting up global tooltip monitoring:",
        error,
      );
    }
  }

  /**
   * Perform global tooltip attachment to all progress rings
   */
  async performGlobalTooltipAttachment() {
    const containers = [
      document.querySelector(".scenarios-grid"),
      document.querySelector(".category-container"),
      document.querySelector(".scenario-container"),
      document.body, // Fallback to search entire page
    ].filter(Boolean);

    for (const container of containers) {
      try {
        await this.attachTooltipsToProgressRingsRobust(container);
      } catch (error) {
        logger.warn(
          "CategoryHeader: Error attaching tooltips to container:",
          error,
        );
      }
    }
  }

  /**
   * Set up monitoring for view changes to reattach tooltips
   */
  setupViewChangeMonitoring() {
    // Monitor for view changes by watching data-view attribute changes
    const observer = new MutationObserver((mutations) => {
      let shouldReattach = false;

      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-view"
        ) {
          logger.debug(
            "CategoryHeader: View change detected, scheduling tooltip reattachment...",
          );
          shouldReattach = true;
        }
      });

      if (shouldReattach) {
        // Delay to ensure view transition is complete
        setTimeout(() => {
          this.performGlobalTooltipAttachment();
        }, 500);
      }
    });

    // Observe all scenarios-grid elements for data-view changes
    document.querySelectorAll(".scenarios-grid").forEach((grid) => {
      observer.observe(grid, {
        attributes: true,
        attributeFilter: ["data-view"],
      });
    });
  }

  /**
   * Set up periodic checks for new progress rings
   */
  setupPeriodicTooltipChecks() {
    setInterval(() => {
      const unfixedRings = document.querySelectorAll(
        '.category-progress-ring:not([data-tooltip-robust="true"])',
      );
      if (unfixedRings.length > 0) {
        logger.debug(
          `CategoryHeader: Found ${unfixedRings.length} unfixed progress rings, applying tooltips...`,
        );
        this.performGlobalTooltipAttachment();
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Get current configuration (async)
   * @returns {Promise<Object>} Configuration object
   */
  async getConfig() {
    return await this.configPromise;
  }

  /**
   * Renders the category header HTML
   * @param {Object} category - Category data
   * @param {Object} progress - Category progress data
   * @returns {Promise<string>} HTML string for category header
   */
  async render(category, progress) {
    const config = await this.getConfig();
    const templates = getHtmlTemplates(config);
    const styling = getStylingConfig(config);

    const progressRingHtml = await this.createProgressRing(category, progress);

    return `
      <div class="${templates.categoryHeader.containerClass}">
        <div class="${templates.categoryHeader.titleGroupClass}">
          <div class="${templates.categoryHeader.iconClass}" style="background-color: ${category.color}${styling.iconBackground.opacityHex}; color: ${category.color}">
            ${category.icon}
          </div>
          <div class="${templates.categoryHeader.infoClass}">
            <h3 class="${templates.categoryHeader.titleClass}">${category.title}</h3>
            <p class="${templates.categoryHeader.descriptionClass}">${category.description}</p>
            <div class="${templates.categoryHeader.metaClass}">
              <div class="${templates.categoryHeader.metaItemsClass}">
                <span class="${templates.categoryMeta.difficultyClass} ${templates.categoryMeta.difficultyPrefix}${category.difficulty}">${category.difficulty}</span>
                <span class="${templates.categoryMeta.timeClass}">${category.estimatedTime} min</span>
                <span class="${templates.categoryMeta.progressTextClass}">${progress.completed}/${progress.total} completed</span>
              </div>
            </div>
          </div>
        </div>
        ${progressRingHtml}
      </div>
    `;
  }

  /**
   * Creates the progress ring with pulse animation and tooltip for badges
   * @param {Object} category - Category object
   * @param {Object} progress - Progress object
   * @returns {Promise<string>} Progress ring HTML
   */
  async createProgressRing(category, progress) {
    const config = await this.getConfig();
    const progressRingConfig = getProgressRingConfig(config);
    const templates = getHtmlTemplates(config);
    const attributes = getAttributes(config);
    const badgeConfig = getBadgeConfig(config);

    // Get badge progress information
    const badgeProgress = badgeManager.getBadgeProgress(category.id);
    const isOneScenarioAwayFromBadge =
      badgeProgress.nextBadge &&
      badgeProgress.progress.remaining === badgeConfig.alertThreshold;

    // Create enhanced tooltip content using configuration
    const tooltipContent = generateTooltipContent(
      config,
      progress,
      badgeProgress,
    );

    // Add badge alert class if one scenario away from earning a badge
    const badgeAlertClass = isOneScenarioAwayFromBadge
      ? ` ${templates.progressRing.badgeAlertClass}`
      : "";

    // Get progress ring styles
    const styles = createProgressRingStyles(
      config,
      category,
      progress.percentage,
    );
    const dimensions = progressRingConfig.dimensions;

    return `
      <div class="${templates.progressRing.containerClass}${badgeAlertClass}" 
           ${attributes.dataTooltip}="${tooltipContent}"
           ${attributes.dataCategoryId}="${category.id}"
           ${attributes.role}="button"
           ${attributes.tabindex}="0"
           ${attributes.ariaLabel}="Category progress: ${tooltipContent}">
        <svg width="${dimensions.width}" height="${dimensions.height}" viewBox="${dimensions.viewBox}">
          <circle cx="${dimensions.centerX || progressRingConfig.positioning.centerX}" 
                  cy="${dimensions.centerY || progressRingConfig.positioning.centerY}" 
                  r="${dimensions.radius}" 
                  fill="none" 
                  stroke="${progressRingConfig.colors.background}" 
                  stroke-width="${dimensions.strokeWidth}"/>
          <circle cx="${dimensions.centerX || progressRingConfig.positioning.centerX}" 
                  cy="${dimensions.centerY || progressRingConfig.positioning.centerY}" 
                  r="${dimensions.radius}" 
                  fill="none" 
                  stroke="${category.color}" 
                  stroke-width="${dimensions.strokeWidth}"
                  stroke-linecap="${styles.strokeLinecap}" 
                  stroke-dasharray="${styles.strokeDasharray}" 
                  stroke-dashoffset="${styles.strokeDashoffset}"
                  style="transform: ${styles.transform}; transform-origin: ${styles.transformOrigin};"/>
        </svg>
        <span class="${templates.progressRing.percentageClass}">${progress.percentage}%</span>
      </div>
    `;
  }

  /**
   * Attaches event listeners to category header elements
   * @param {HTMLElement} container - Container element with category headers
   */
  async attachEventListeners(container) {
    if (!container) return;

    logger.debug("CategoryHeader: attachEventListeners called", {
      containerType: container.tagName,
      progressRingsFound: container.querySelectorAll(".category-progress-ring")
        .length,
    });

    // Single, robust tooltip attachment method
    await this.attachTooltipsToProgressRings(container);

    // TIMING FIX: Single retry for late-rendered elements
    setTimeout(async () => {
      await this.attachTooltipsToProgressRings(container);
    }, 1000);

    // Set up MutationObserver to catch dynamically added progress rings
    await this.setupProgressRingObserver(container);

    logger.debug("CategoryHeader: attachEventListeners completed", {
      boundEventsCount: this.boundEvents.size,
    });
  }

  /**
   * Sets up a MutationObserver to automatically attach tooltips to new progress rings
   * @param {HTMLElement} container - Container to observe
   */
  async setupProgressRingObserver(container) {
    if (!container || this.mutationObserver) return;

    const config = await this.getConfig();
    const selectors = getSelectors(config);

    this.mutationObserver = new MutationObserver((mutations) => {
      let hasNewRings = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a progress ring or contains progress rings
              const isProgressRing = node.classList?.contains(
                "category-progress-ring",
              );
              const hasProgressRings =
                node.querySelectorAll?.(selectors.allProgressRings).length > 0;

              if (isProgressRing || hasProgressRings) {
                hasNewRings = true;
              }
            }
          });
        }
      });

      if (hasNewRings) {
        logger.debug(
          "CategoryHeader: New progress rings detected, attaching tooltips...",
        );
        // Small delay to ensure DOM is fully updated
        setTimeout(() => {
          this.attachTooltipsToProgressRings(container);
        }, 100);
      }
    });

    // Start observing
    this.mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    logger.debug("CategoryHeader: MutationObserver set up for progress rings");
  }

  /**
   * Enhanced tooltip attachment with robust error handling and fallbacks
   * This ensures tooltips work reliably across all views and scenarios
   * @param {HTMLElement} container - Container element
   */
  async attachTooltipsToProgressRingsRobust(container) {
    logger.debug("CategoryHeader: Starting robust tooltip attachment...");

    try {
      const config = await this.getConfig();
      const selectors = getSelectors(config);

      // Find all progress rings in the container
      const rings = container.querySelectorAll(selectors.allProgressRings);
      logger.debug(
        `CategoryHeader: Found ${rings.length} progress rings for tooltip attachment`,
      );

      if (rings.length === 0) {
        logger.warn(
          "CategoryHeader: No progress rings found for tooltip attachment",
        );
        return;
      }

      // Process each ring with enhanced error handling
      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];

        try {
          // Skip if ring is not in DOM or already processed
          if (!ring || !ring.parentNode) {
            logger.debug(`CategoryHeader: Skipping ring ${i + 1} - not in DOM`);
            continue;
          }

          // Skip if already has robust tooltips attached
          if (ring.getAttribute("data-tooltip-robust") === "true") {
            logger.debug(
              `CategoryHeader: Skipping ring ${i + 1} - already has robust tooltips`,
            );
            continue;
          }

          // Ensure tooltip data exists
          await this.ensureTooltipData(ring, i);

          // Ensure accessibility attributes
          this.ensureAccessibilityAttributes(ring);

          // Remove old event listeners first
          this.removeEventListeners(ring);

          // Attach enhanced event listeners
          await this.attachEnhancedEventListeners(ring, i);

          // Mark as having robust tooltips
          ring.setAttribute("data-tooltip-robust", "true");

          logger.debug(
            `CategoryHeader: Successfully attached robust tooltips to ring ${i + 1}`,
          );
        } catch (ringError) {
          logger.error(
            `CategoryHeader: Failed to attach tooltips to ring ${i + 1}:`,
            ringError,
          );
          // Continue with other rings even if one fails
        }
      }

      logger.info(
        `CategoryHeader: Robust tooltip attachment completed for ${rings.length} rings`,
      );
    } catch (error) {
      logger.error(
        "CategoryHeader: Error in robust tooltip attachment:",
        error,
      );
    }
  }

  /**
   * Ensure accessibility attributes for progress ring
   * @param {HTMLElement} ring - Progress ring element
   */
  ensureAccessibilityAttributes(ring) {
    if (!ring.hasAttribute("role")) {
      ring.setAttribute("role", "button");
    }
    if (!ring.hasAttribute("tabindex")) {
      ring.setAttribute("tabindex", "0");
    }
    if (!ring.hasAttribute("aria-label")) {
      const tooltipContent = ring.getAttribute("data-tooltip");
      ring.setAttribute("aria-label", `Category progress: ${tooltipContent}`);
    }
  }

  /**
   * Attach enhanced event listeners with better error handling
   * @param {HTMLElement} ring - Progress ring element
   * @param {number} index - Ring index for debugging
   */
  async attachEnhancedEventListeners(ring, index) {
    const config = await this.getConfig();

    // Create enhanced event handlers with error handling
    const showTooltipEnhanced = async (event) => {
      try {
        // Use event.target as fallback if currentTarget is null
        const targetRing = event.currentTarget || event.target;
        if (!targetRing) {
          logger.warn(
            `CategoryHeader: No target for tooltip show event on ring ${index + 1}`,
          );
          return;
        }

        const rect = targetRing.getBoundingClientRect();
        const content = targetRing.getAttribute("data-tooltip");

        if (!content) {
          logger.warn(
            `CategoryHeader: No tooltip content for ring ${index + 1}`,
          );
          return;
        }

        // Create tooltip with enhanced styling
        this.createEnhancedTooltip(content, rect, targetRing);

        logger.debug(
          `CategoryHeader: Enhanced tooltip shown for ring ${index + 1}`,
        );
      } catch (error) {
        logger.error(
          `CategoryHeader: Error showing enhanced tooltip for ring ${index + 1}:`,
          error,
        );
      }
    };

    const hideTooltipEnhanced = () => {
      try {
        // Remove all tooltips created by this component
        document
          .querySelectorAll(
            ".progress-ring-tooltip, .enhanced-progress-tooltip",
          )
          .forEach((el) => el.remove());

        // Clear ring reference
        if (ring._currentTooltip) {
          ring._currentTooltip = null;
        }
      } catch (error) {
        logger.error(
          `CategoryHeader: Error hiding enhanced tooltip for ring ${index + 1}:`,
          error,
        );
      }
    };

    // Attach event listeners with error handling
    try {
      ring.addEventListener("mouseenter", showTooltipEnhanced);
      ring.addEventListener("mouseleave", hideTooltipEnhanced);

      // Touch support
      ring.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          showTooltipEnhanced(e);
          setTimeout(hideTooltipEnhanced, 3000);
        },
        { passive: false },
      );

      // Click support
      ring.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if ("ontouchstart" in window) {
          if (ring._currentTooltip) {
            hideTooltipEnhanced();
          } else {
            showTooltipEnhanced(e);
            setTimeout(hideTooltipEnhanced, 3000);
          }
        }
      });

      // Keyboard support
      ring.addEventListener("keydown", (e) => {
        if (["Enter", " ", "Escape"].includes(e.key)) {
          e.preventDefault();
          if (e.key === "Escape") {
            hideTooltipEnhanced();
          } else {
            showTooltipEnhanced(e);
            setTimeout(hideTooltipEnhanced, 3000);
          }
        }
      });

      // Store event listeners for cleanup
      ring._enhancedTooltipListeners = {
        showTooltipEnhanced,
        hideTooltipEnhanced,
      };
    } catch (error) {
      logger.error(
        `CategoryHeader: Error attaching enhanced event listeners to ring ${index + 1}:`,
        error,
      );
    }
  }

  /**
   * Create enhanced tooltip with better styling and positioning
   * @param {string} content - Tooltip content
   * @param {DOMRect} rect - Target element rect
   * @param {HTMLElement} targetRing - Target ring element
   */
  createEnhancedTooltip(content, rect, targetRing) {
    // Remove existing tooltips
    document
      .querySelectorAll(".progress-ring-tooltip, .enhanced-progress-tooltip")
      .forEach((el) => el.remove());

    const tooltip = document.createElement("div");
    tooltip.className =
      "progress-ring-tooltip visible enhanced-progress-tooltip";
    tooltip.textContent = content;

    // Enhanced styling
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
      transition: opacity 0.2s ease !important;
    `;

    // Handle screen edge positioning
    if (rect.top - 50 < 0) {
      tooltip.style.top = `${rect.bottom + 8}px !important`;
    }

    // Prevent tooltip from going off screen horizontally
    const tooltipRect = tooltip.getBoundingClientRect();
    if (rect.left + rect.width / 2 - 150 < 0) {
      tooltip.style.left = "10px !important";
      tooltip.style.transform = "none !important";
    } else if (rect.left + rect.width / 2 + 150 > window.innerWidth) {
      tooltip.style.right = "10px !important";
      tooltip.style.left = "auto !important";
      tooltip.style.transform = "none !important";
    }

    document.body.appendChild(tooltip);
    targetRing._currentTooltip = tooltip;

    return tooltip;
  }

  /**
   * Consolidated method to attach tooltips to progress rings
   * Replaces attachProgressRingTooltips, retryAttachTooltips, robustTooltipAttachment, and attachRobustListeners
   * @param {HTMLElement} container - Container element
   */
  async attachTooltipsToProgressRings(container) {
    // Use the robust implementation as the default
    return this.attachTooltipsToProgressRingsRobust(container);
  }

  /**
   * Attaches event listeners to a single progress ring
   * @param {HTMLElement} ring - Progress ring element
   */
  attachSingleRingListeners(ring) {
    // Create bound event handlers with consistent binding
    const boundHandlers = {
      mouseenter: (e) => this.showTooltip(e),
      mouseleave: () => this.hideTooltip(),
      touchstart: (e) => this.handleProgressRingTouch(e),
      click: (e) => this.handleProgressRingClick(e),
      keydown: (e) => this.handleProgressRingKeydown(e),
    };

    // Store bound handlers for cleanup
    this.boundEvents.set(ring, boundHandlers);

    // Attach all event listeners
    Object.entries(boundHandlers).forEach(([event, handler]) => {
      ring.addEventListener(event, handler);
    });

    // Mark ring as having tooltip listeners attached
    ring._tooltipAttached = true;
  }

  /**
   * Ensures a progress ring has tooltip data
   * @param {HTMLElement} ring - Progress ring element
   * @param {number} index - Ring index for fallback naming
   */
  async ensureTooltipData(ring, index) {
    const config = await this.getConfig();
    const selectors = getSelectors(config);

    if (!ring.hasAttribute("data-tooltip")) {
      // Create fallback tooltip data like the manual fix
      const percentage =
        ring.querySelector(selectors.percentageSpan)?.textContent || "0%";
      const categoryId =
        ring.getAttribute("data-category-id") || `category-${index + 1}`;

      // Try to get better tooltip content if possible
      let tooltipContent = `Progress: ${percentage}`;

      // Look for category title in parent elements for better context
      const categoryTitle = ring
        .closest(selectors.categoryHeader)
        ?.querySelector(selectors.categoryTitle)?.textContent;
      if (categoryTitle) {
        tooltipContent = `${categoryTitle}: ${percentage} complete`;
      } else if (categoryId && categoryId !== `category-${index + 1}`) {
        tooltipContent = `${categoryId}: ${percentage} complete`;
      }

      ring.setAttribute("data-tooltip", tooltipContent);
      logger.debug(
        `CategoryHeader: Added missing tooltip data to ring ${index}:`,
        tooltipContent,
      );
    }
  }

  /**
   * Updates MutationObserver to call the consolidated attachment method
   */

  /**
   * Removes event listeners from a progress ring
   * @param {HTMLElement} ring - Progress ring element
   */
  removeEventListeners(ring) {
    const boundHandlers = this.boundEvents.get(ring);
    if (boundHandlers) {
      Object.entries(boundHandlers).forEach(([event, handler]) => {
        ring.removeEventListener(event, handler);
      });
      this.boundEvents.delete(ring);
    }
  }

  /**
   * Shows tooltip for progress ring
   * @param {Event} event - Mouse or touch event
   */
  async showTooltip(event) {
    try {
      const config = await this.getConfig();
      const tooltipConfig = getTooltipConfig(config);
      const templates = getHtmlTemplates(config);
      const selectors = getSelectors(config);
      let ring = event.currentTarget;

      // Fallback to event.target if currentTarget is null
      if (!ring && event.target) {
        ring = event.target;
        logger.warn(
          "CategoryHeader showTooltip: using event.target as fallback",
          {
            eventType: event?.type,
            target: event.target,
            targetClass: event.target?.className,
          },
        );
      }

      // Final null check for ring element
      if (!ring) {
        logger.error(
          "CategoryHeader showTooltip: both event.currentTarget and event.target are null",
          {
            event: event,
            eventType: event?.type,
            eventTarget: event?.target,
          },
        );
        return;
      }

      const tooltip = ring.getAttribute(getAttributes(config).dataTooltip);

      // Debug logging
      logger.debug("CategoryHeader showTooltip called", {
        ring: ring,
        tooltipContent: tooltip,
        hasTooltipAttr: ring.hasAttribute("data-tooltip"),
        config: config ? "loaded" : "null",
        tooltipConfig: tooltipConfig ? "loaded" : "null",
      });

      if (!tooltip) {
        logger.warn("CategoryHeader showTooltip: no tooltip content found", {
          ring: ring,
          categoryId: ring.getAttribute("data-category-id"),
          hasDataTooltip: ring.hasAttribute("data-tooltip"),
          allAttributes: Array.from(ring.attributes).map(
            (attr) => `${attr.name}="${attr.value}"`,
          ),
        });

        // FALLBACK: Create a basic tooltip if data is missing
        const categoryId = ring.getAttribute("data-category-id");
        const percentage =
          ring.querySelector(selectors.percentageSpan)?.textContent || "0%";
        const fallbackTooltip =
          `Category progress: ${percentage}` +
          (categoryId ? ` (${categoryId})` : "");

        logger.debug("CategoryHeader using fallback tooltip:", fallbackTooltip);

        // Use fallback tooltip content
        const tooltipEl = document.createElement("div");
        tooltipEl.className = templates.progressRing.tooltipClass;
        tooltipEl.textContent = fallbackTooltip;
        tooltipEl.setAttribute(
          getAttributes(config).role,
          tooltipConfig.accessibility.role,
        );

        // Position tooltip above the progress ring
        const rect = ring.getBoundingClientRect();
        tooltipEl.style.position = tooltipConfig.positioning.position;
        tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
        tooltipEl.style.transform = tooltipConfig.positioning.transform;
        tooltipEl.style.zIndex = tooltipConfig.zIndex.toString();

        document.body.appendChild(tooltipEl);

        // Calculate position after adding to DOM
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const topPosition =
          rect.top - tooltipRect.height - tooltipConfig.offset;

        if (topPosition < 0) {
          tooltipEl.style.top = `${rect.bottom + tooltipConfig.offset}px`;
        } else {
          tooltipEl.style.top = `${topPosition}px`;
        }

        // Make visible
        tooltipEl.classList.add(templates.progressRing.visibleClass);

        // Store reference for cleanup
        ring._tooltip = tooltipEl;

        return;
      }

      // Remove any existing tooltips
      this.hideTooltip();

      // Create tooltip element
      const tooltipEl = document.createElement("div");
      tooltipEl.className = templates.progressRing.tooltipClass;
      tooltipEl.textContent = tooltip;
      tooltipEl.setAttribute(
        getAttributes(config).role,
        tooltipConfig.accessibility.role,
      );

      // Position tooltip above the progress ring
      const rect = ring.getBoundingClientRect();
      tooltipEl.style.position = tooltipConfig.positioning.position;
      tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
      tooltipEl.style.transform = tooltipConfig.positioning.transform;
      tooltipEl.style.zIndex = tooltipConfig.zIndex.toString();

      document.body.appendChild(tooltipEl);

      logger.debug("CategoryHeader tooltip element created and appended", {
        tooltip: tooltipEl,
        className: tooltipEl.className,
        position: tooltipEl.style.position,
        left: tooltipEl.style.left,
        zIndex: tooltipEl.style.zIndex,
      });

      // Calculate position after adding to DOM so we can get tooltip height
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const topPosition = rect.top - tooltipRect.height - tooltipConfig.offset;

      // If tooltip would go off-screen at top, show it below instead
      if (topPosition < 0) {
        tooltipEl.style.top = `${rect.bottom + tooltipConfig.offset}px`;
      } else {
        tooltipEl.style.top = `${topPosition}px`;
      }

      // Trigger the visible state with a small delay to ensure CSS transition works
      if (tooltipConfig.performance?.useRequestAnimationFrame) {
        requestAnimationFrame(() => {
          tooltipEl.classList.add(templates.progressRing.visibleClass);
          logger.debug("CategoryHeader tooltip made visible (RAF)", {
            visibleClass: templates.progressRing.visibleClass,
          });
        });
      } else {
        tooltipEl.classList.add(templates.progressRing.visibleClass);
        logger.debug("CategoryHeader tooltip made visible (immediate)", {
          visibleClass: templates.progressRing.visibleClass,
        });
      }

      // Store reference for cleanup
      ring._tooltip = tooltipEl;
    } catch (error) {
      logger.error("CategoryHeader showTooltip error", error);
    }
  }

  /**
   * Hides tooltip for progress ring
   */
  async hideTooltip() {
    const config = await this.getConfig();
    const selectors = getSelectors(config);

    const existingTooltips = document.querySelectorAll(
      selectors.existingTooltips,
    );
    existingTooltips.forEach((tooltip) => {
      tooltip.remove();
    });

    // Clear tooltip references
    const rings = document.querySelectorAll(selectors.allProgressRings);
    rings.forEach((ring) => {
      if (ring._tooltip) {
        ring._tooltip = null;
      }
    });
  }

  /**
   * Handles touch events for mobile tooltip
   * @param {Event} event - Touch event
   */
  async handleProgressRingTouch(event) {
    const config = await this.getConfig();
    const tooltipConfig = getTooltipConfig(config);

    event.preventDefault();
    this.showTooltip(event);

    // Hide tooltip after delay on mobile
    setTimeout(() => {
      this.hideTooltip();
    }, tooltipConfig.mobile.duration);
  }

  /**
   * Handles click events for progress ring
   * @param {Event} event - Click event
   */
  async handleProgressRingClick(event) {
    const config = await this.getConfig();
    const tooltipConfig = getTooltipConfig(config);

    event.preventDefault();
    event.stopPropagation();

    // On mobile, toggle tooltip
    if ("ontouchstart" in window) {
      let ring = event.currentTarget;

      // Fallback to event.target if currentTarget is null
      if (!ring && event.target) {
        ring = event.target;
        logger.warn(
          "CategoryHeader handleProgressRingClick: using event.target as fallback",
          {
            eventType: event?.type,
            target: event.target,
            targetClass: event.target?.className,
          },
        );
      }

      // Final null check for ring element
      if (!ring) {
        logger.error(
          "CategoryHeader handleProgressRingClick: both event.currentTarget and event.target are null",
          {
            event: event,
            eventType: event?.type,
            eventTarget: event?.target,
          },
        );
        return;
      }

      if (ring._tooltip) {
        this.hideTooltip();
      } else {
        this.showTooltip(event);
        setTimeout(() => this.hideTooltip(), tooltipConfig.mobile.duration);
      }
    }
  }

  /**
   * Handles keyboard events for progress ring accessibility
   * @param {Event} event - Keyboard event
   */
  async handleProgressRingKeydown(event) {
    const config = await this.getConfig();
    const tooltipConfig = getTooltipConfig(config);
    const eventsConfig = getEventsConfig(config);

    if (eventsConfig.accessibility.supportedKeys.includes(event.key)) {
      event.preventDefault();
      this.showTooltip(event);

      // Hide tooltip after delay
      setTimeout(() => {
        this.hideTooltip();
      }, tooltipConfig.mobile.duration);
    } else if (event.key === "Escape") {
      this.hideTooltip();
    }
  }

  /**
   * Cleans up all event listeners and tooltips
   */
  cleanup() {
    // Remove all tooltips
    this.hideTooltip();

    // Remove all event listeners
    this.boundEvents.forEach((handlers, ring) => {
      this.removeEventListeners(ring);
    });

    this.boundEvents.clear();

    // Clean up MutationObserver
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
      logger.debug("CategoryHeader: MutationObserver cleaned up");
    }
  }

  /**
   * Updates the progress ring for a specific category in real-time
   * @param {string} categoryId - Category identifier
   * @param {Object} category - Category data
   * @param {Object} progress - Updated progress data
   * @param {HTMLElement} container - Container element to search within
   */
  async updateProgressRing(categoryId, category, progress, container) {
    try {
      if (!container || !categoryId || !category || !progress) {
        logger.debug("updateProgressRing: Missing required parameters", {
          hasContainer: !!container,
          hasCategoryId: !!categoryId,
          hasCategory: !!category,
          hasProgress: !!progress,
        });
        return;
      }

      const config = await this.getConfig();
      const selectors = getSelectors(config);
      const templates = getHtmlTemplates(config);
      const attributes = getAttributes(config);
      const badgeConfig = getBadgeConfig(config);

      // Find the progress ring for this category
      const categorySelector = getCategorySelector(config, categoryId);
      const progressRing = container.querySelector(categorySelector);

      if (!progressRing) {
        logger.debug("updateProgressRing: Progress ring not found", {
          categoryId,
          containerSelector: container.tagName,
          availableRings: container.querySelectorAll(selectors.allProgressRings)
            .length,
        });
        return;
      }

      logger.debug("updateProgressRing: Found progress ring, updating...", {
        categoryId,
        currentPercentage: progress.percentage,
        progressRingExists: !!progressRing,
      });

      // Update the progress circle stroke-dashoffset
      const progressCircle = progressRing.querySelector(
        selectors.progressCircle,
      );
      if (progressCircle) {
        const newOffset = calculateProgressOffset(config, progress.percentage);
        progressCircle.style.strokeDashoffset = newOffset;
      }

      // Update the percentage text
      const percentageSpan = progressRing.querySelector(
        selectors.percentageSpan,
      );
      if (percentageSpan) {
        percentageSpan.textContent = `${progress.percentage}%`;
      }

      // Update badge alert class and tooltip
      badgeManager.refreshCategoryProgress();
      const badgeProgress = badgeManager.getBadgeProgress(categoryId);
      const isOneScenarioAwayFromBadge =
        badgeProgress.nextBadge &&
        badgeProgress.progress.remaining === badgeConfig.alertThreshold;

      // Update badge alert class
      if (isOneScenarioAwayFromBadge) {
        progressRing.classList.add(templates.progressRing.badgeAlertClass);
      } else {
        progressRing.classList.remove(templates.progressRing.badgeAlertClass);
      }

      // Update tooltip content using configuration
      const tooltipContent = generateTooltipContent(
        config,
        progress,
        badgeProgress,
      );

      progressRing.setAttribute(attributes.dataTooltip, tooltipContent);
      progressRing.setAttribute(
        attributes.ariaLabel,
        `Category progress: ${tooltipContent}`,
      );

      // Update category progress text in meta section if present
      const categoryProgressText = container.querySelector(
        selectors.categoryProgressText,
      );
      if (categoryProgressText) {
        categoryProgressText.textContent = `${progress.completed}/${progress.total} completed`;
      }

      logger.debug("Progress ring updated successfully", {
        categoryId,
        percentage: progress.percentage,
        badgeAlert: isOneScenarioAwayFromBadge,
      });

      // TOOLTIP FIX: Ensure tooltip functionality after progress ring update
      // This handles cases where progress rings are updated dynamically
      if (!progressRing._tooltipAttached) {
        setTimeout(() => {
          this.attachTooltipsToProgressRings(container);
        }, 100);
      }
    } catch (error) {
      logger.error("Error updating progress ring:", error);
    }
  }

  /**
   * Checks if user is one scenario away from earning the next badge
   * @param {string} categoryId - Category identifier
   * @returns {Promise<Object|null>} Next badge info if one scenario away, null otherwise
   */
  async isOneScenarioFromNextBadge(categoryId) {
    try {
      const config = await this.getConfig();
      const badgeConfig = getBadgeConfig(config);

      // Ensure badge manager has latest progress data
      badgeManager.refreshCategoryProgress();

      const progress = badgeManager.getBadgeProgress(categoryId);

      if (!progress || !progress.nextBadge || !progress.progress) {
        return null;
      }

      const { remaining } = progress.progress;

      // Check if exactly one scenario away from next badge
      if (remaining === badgeConfig.alertThreshold) {
        return {
          nextBadge: progress.nextBadge,
          current: progress.progress.current,
          required: progress.progress.required,
          badgeTitle: progress.nextBadge.title,
          sidekickEmoji: progress.nextBadge.sidekickEmoji,
        };
      }

      return null;
    } catch (error) {
      logger.error("Error checking badge progress:", error);
      return null;
    }
  }
}

// Global automatic initialization for all users
// This ensures tooltips work without manual intervention
if (typeof window !== "undefined") {
  // Create a global instance for automatic tooltip management
  window.categoryHeaderTooltipManager = new CategoryHeader();

  // Also expose the class for manual instantiation
  window.CategoryHeader = CategoryHeader;

  logger.info(
    "CategoryHeader: Global tooltip management initialized automatically",
  );
}

export default CategoryHeader;
