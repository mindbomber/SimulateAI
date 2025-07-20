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

// Constants
const PROGRESS_CIRCLE_CIRCUMFERENCE = 163; // 2 * π * 26 (radius)
const TOOLTIP_OFFSET = 8; // Tooltip offset from progress ring
const MOBILE_TOOLTIP_DURATION = 3000; // Mobile tooltip display duration

class CategoryHeader {
  constructor() {
    this.boundEvents = new Map(); // Track bound event handlers for cleanup
  }

  /**
   * Renders the category header HTML
   * @param {Object} category - Category data
   * @param {Object} progress - Category progress data
   * @returns {string} HTML string for category header
   */
  render(category, progress) {
    const progressRingHtml = this.createProgressRing(category, progress);

    return `
      <div class="category-header">
        <div class="category-title-group">
          <div class="category-icon-large" style="background-color: ${category.color}20; color: ${category.color}">
            ${category.icon}
          </div>
          <div class="category-info">
            <h3 class="category-title">${category.title}</h3>
            <p class="category-description">${category.description}</p>
            <div class="category-meta">
              <div class="category-meta-items">
                <span class="category-difficulty difficulty-${category.difficulty}">${category.difficulty}</span>
                <span class="category-time">${category.estimatedTime} min</span>
                <span class="category-progress-text">${progress.completed}/${progress.total} completed</span>
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
   * @returns {string} Progress ring HTML
   */
  createProgressRing(category, progress) {
    // Get badge progress information
    const badgeProgress = badgeManager.getBadgeProgress(category.id);
    const isOneScenarioAwayFromBadge =
      badgeProgress.nextBadge && badgeProgress.progress.remaining === 1;

    // Create enhanced tooltip content
    let tooltipContent = `${progress.completed} of ${progress.total} scenarios completed`;

    if (badgeProgress.nextBadge) {
      if (isOneScenarioAwayFromBadge) {
        tooltipContent += `. 1 more to unlock next badge: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
      } else {
        const { remaining } = badgeProgress.progress;
        tooltipContent += `. ${remaining} more to unlock next badge: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
      }
    } else {
      tooltipContent += ` (${progress.percentage}%)`;
    }

    // Add badge alert class if one scenario away from earning a badge
    const badgeAlertClass = isOneScenarioAwayFromBadge ? " badge-alert" : "";

    return `
      <div class="category-progress-ring${badgeAlertClass}" 
           data-tooltip="${tooltipContent}"
           data-category-id="${category.id}"
           role="button"
           tabindex="0"
           aria-label="Category progress: ${tooltipContent}">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#e5e7eb" stroke-width="4"/>
          <circle cx="30" cy="30" r="26" fill="none" stroke="${category.color}" stroke-width="4"
                  stroke-linecap="round" stroke-dasharray="${PROGRESS_CIRCLE_CIRCUMFERENCE}" 
                  stroke-dashoffset="${PROGRESS_CIRCLE_CIRCUMFERENCE - (progress.percentage / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE}"
                  style="transform: rotate(-90deg); transform-origin: 30px 30px;"/>
        </svg>
        <span class="progress-percentage">${progress.percentage}%</span>
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
  attachProgressRingTooltips(container) {
    const progressRings = container.querySelectorAll(
      ".category-progress-ring[data-tooltip]",
    );

    progressRings.forEach((ring) => {
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
  showTooltip(event) {
    const ring = event.currentTarget;
    const tooltip = ring.getAttribute("data-tooltip");

    if (!tooltip) return;

    // Remove any existing tooltips
    this.hideTooltip();

    // Create tooltip element
    const tooltipEl = document.createElement("div");
    tooltipEl.className = "progress-ring-tooltip";
    tooltipEl.textContent = tooltip;
    tooltipEl.setAttribute("role", "tooltip");

    // Position tooltip above the progress ring
    const rect = ring.getBoundingClientRect();
    tooltipEl.style.position = "fixed";
    tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
    tooltipEl.style.transform = "translateX(-50%)";
    tooltipEl.style.zIndex = "1000";

    document.body.appendChild(tooltipEl);

    // Calculate position after adding to DOM so we can get tooltip height
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const topPosition = rect.top - tooltipRect.height - TOOLTIP_OFFSET;

    // If tooltip would go off-screen at top, show it below instead
    if (topPosition < 0) {
      tooltipEl.style.top = `${rect.bottom + TOOLTIP_OFFSET}px`;
    } else {
      tooltipEl.style.top = `${topPosition}px`;
    }

    // Trigger the visible state with a small delay to ensure CSS transition works
    requestAnimationFrame(() => {
      tooltipEl.classList.add("visible");
    });

    // Store reference for cleanup
    ring._tooltip = tooltipEl;
  }

  /**
   * Hides tooltip for progress ring
   */
  hideTooltip() {
    const existingTooltips = document.querySelectorAll(
      ".progress-ring-tooltip",
    );
    existingTooltips.forEach((tooltip) => {
      tooltip.remove();
    });

    // Clear tooltip references
    const rings = document.querySelectorAll(".category-progress-ring");
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
  handleProgressRingTouch(event) {
    event.preventDefault();
    this.showTooltip(event);

    // Hide tooltip after delay on mobile
    setTimeout(() => {
      this.hideTooltip();
    }, MOBILE_TOOLTIP_DURATION);
  }

  /**
   * Handles click events for progress ring
   * @param {Event} event - Click event
   */
  handleProgressRingClick(event) {
    event.preventDefault();
    event.stopPropagation();

    // On mobile, toggle tooltip
    if ("ontouchstart" in window) {
      const ring = event.currentTarget;
      if (ring._tooltip) {
        this.hideTooltip();
      } else {
        this.showTooltip(event);
        setTimeout(() => this.hideTooltip(), MOBILE_TOOLTIP_DURATION);
      }
    }
  }

  /**
   * Handles keyboard events for progress ring accessibility
   * @param {Event} event - Keyboard event
   */
  handleProgressRingKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.showTooltip(event);

      // Hide tooltip after delay
      setTimeout(() => {
        this.hideTooltip();
      }, MOBILE_TOOLTIP_DURATION);
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
  updateProgressRing(categoryId, category, progress, container) {
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

      // Find the progress ring for this category
      const progressRing = container.querySelector(
        `.category-progress-ring[data-category-id="${categoryId}"]`,
      );

      if (!progressRing) {
        logger.debug("updateProgressRing: Progress ring not found", {
          categoryId,
          containerSelector: container.tagName,
          availableRings: container.querySelectorAll(".category-progress-ring")
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
        "circle[stroke-dasharray]",
      );
      if (progressCircle) {
        const newOffset =
          PROGRESS_CIRCLE_CIRCUMFERENCE -
          (progress.percentage / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE;
        progressCircle.style.strokeDashoffset = newOffset;
      }

      // Update the percentage text
      const percentageSpan = progressRing.querySelector(".progress-percentage");
      if (percentageSpan) {
        percentageSpan.textContent = `${progress.percentage}%`;
      }

      // Update badge alert class and tooltip
      badgeManager.refreshCategoryProgress();
      const badgeProgress = badgeManager.getBadgeProgress(categoryId);
      const isOneScenarioAwayFromBadge =
        badgeProgress.nextBadge && badgeProgress.progress.remaining === 1;

      // Update badge alert class
      if (isOneScenarioAwayFromBadge) {
        progressRing.classList.add("badge-alert");
      } else {
        progressRing.classList.remove("badge-alert");
      }

      // Update tooltip content
      let tooltipContent = `${progress.completed} of ${progress.total} scenarios completed`;

      if (badgeProgress.nextBadge) {
        if (isOneScenarioAwayFromBadge) {
          tooltipContent += `. 1 more to unlock next badge: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
        } else {
          const { remaining } = badgeProgress.progress;
          tooltipContent += `. ${remaining} more to unlock next badge: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
        }
      } else {
        tooltipContent += ` (${progress.percentage}%)`;
      }

      progressRing.setAttribute("data-tooltip", tooltipContent);
      progressRing.setAttribute(
        "aria-label",
        `Category progress: ${tooltipContent}`,
      );

      // Update category progress text in meta section if present
      const categoryProgressText = container.querySelector(
        `.category-meta .category-progress-text`,
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
   * @returns {Object|null} Next badge info if one scenario away, null otherwise
   */
  isOneScenarioFromNextBadge(categoryId) {
    try {
      // Ensure badge manager has latest progress data
      badgeManager.refreshCategoryProgress();

      const progress = badgeManager.getBadgeProgress(categoryId);

      if (!progress || !progress.nextBadge || !progress.progress) {
        return null;
      }

      const { remaining } = progress.progress;

      // Check if exactly one scenario away from next badge
      if (remaining === 1) {
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
