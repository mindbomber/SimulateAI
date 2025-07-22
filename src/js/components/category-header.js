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
    this.boundEvents = new Map(); // Track bound event handlers for cleanup

    // Configuration will be loaded when needed
    this.configPromise = CategoryHeader.loadConfiguration();
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
  attachEventListeners(container) {
    if (!container) return;

    // Add tooltip functionality for progress rings
    this.attachProgressRingTooltips(container);
  }

  /**
   * Attaches tooltip functionality to progress rings
   * @param {HTMLElement} container - Container element
   */
  async attachProgressRingTooltips(container) {
    const config = await this.getConfig();
    const selectors = getSelectors(config);

    // Try the specific selector first, then fallback to all progress rings
    let progressRings = container.querySelectorAll(selectors.progressRing);

    if (progressRings.length === 0) {
      // Fallback to all progress rings if the specific selector doesn't find any
      progressRings = container.querySelectorAll(selectors.allProgressRings);
      logger.debug("CategoryHeader using fallback selector for progress rings");
    }

    // Debug logging
    logger.debug("CategoryHeader attachProgressRingTooltips called", {
      container: container,
      selector: selectors.progressRing,
      fallbackSelector: selectors.allProgressRings,
      foundRings: progressRings.length,
      allRings: container.querySelectorAll(".category-progress-ring").length,
    });

    progressRings.forEach((ring) => {
      // Only attach to rings that have tooltip data
      if (!ring.hasAttribute("data-tooltip")) {
        logger.debug("CategoryHeader skipping ring without tooltip", { ring });
        return;
      }

      // Clean up existing listeners first
      this.removeEventListeners(ring);

      // Create bound event handlers for cleanup
      const boundHandlers = {
        mouseenter: this.showTooltip.bind(this),
        mouseleave: this.hideTooltip.bind(this),
        touchstart: this.handleProgressRingTouch.bind(this),
        click: this.handleProgressRingClick.bind(this),
        keydown: this.handleProgressRingKeydown.bind(this),
      };

      // Store bound handlers for cleanup
      this.boundEvents.set(ring, boundHandlers);

      // Desktop: hover events
      ring.addEventListener("mouseenter", boundHandlers.mouseenter);
      ring.addEventListener("mouseleave", boundHandlers.mouseleave);

      // Mobile: touch/tap events
      ring.addEventListener("touchstart", boundHandlers.touchstart);
      ring.addEventListener("click", boundHandlers.click);

      // Keyboard accessibility
      ring.addEventListener("keydown", boundHandlers.keydown);

      // Debug logging for each ring
      logger.debug("CategoryHeader attached listeners to ring", {
        hasTooltip: ring.hasAttribute("data-tooltip"),
        categoryId: ring.getAttribute("data-category-id"),
        tooltipContent: ring.getAttribute("data-tooltip"),
      });
    });
  }

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
      const ring = event.currentTarget;
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
        logger.warn("CategoryHeader showTooltip: no tooltip content found");
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
      const ring = event.currentTarget;
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

export default CategoryHeader;
