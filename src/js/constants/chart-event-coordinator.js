/**
 * Chart Event Coordinator
 * Prevents event conflicts between different chart systems
 * Ensures only one chart system handles events per DOM element
 *
 * @version 1.0.0
 * @author SimulateAI Team
 */

import logger from "../utils/logger.js";

class ChartEventCoordinator {
  constructor() {
    this.registeredElements = new Map(); // element -> system mapping
    this.activeEventHandlers = new Map(); // element -> handlers mapping
    this.systemInstances = new Map(); // system -> instances mapping
  }

  /**
   * Register a chart element with a specific system
   * @param {HTMLElement|string} element - DOM element or selector
   * @param {string} system - Chart system identifier
   * @param {Object} instance - Chart instance
   * @returns {boolean} Success status
   */
  registerElement(element, system, instance) {
    try {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;

      if (!el) {
        logger.error("ChartEventCoordinator", `Element not found: ${element}`);
        return false;
      }

      // Check if element is already registered with a different system
      if (this.registeredElements.has(el)) {
        const existingSystem = this.registeredElements.get(el);
        if (existingSystem !== system) {
          logger.warn(
            "ChartEventCoordinator",
            `Element already registered with ${existingSystem}, transferring to ${system}`,
          );
          this.unregisterElement(el);
        }
      }

      // Register element with system
      this.registeredElements.set(el, system);

      // Track system instances
      if (!this.systemInstances.has(system)) {
        this.systemInstances.set(system, new Set());
      }
      this.systemInstances.get(system).add(instance);

      logger.info(
        "ChartEventCoordinator",
        `Registered element with ${system}`,
        {
          elementId: el.id || "no-id",
          system,
          totalInstances: this.systemInstances.get(system).size,
        },
      );

      return true;
    } catch (error) {
      logger.error(
        "ChartEventCoordinator",
        "Failed to register element",
        error,
      );
      return false;
    }
  }

  /**
   * Unregister a chart element
   * @param {HTMLElement|string} element - DOM element or selector
   * @returns {boolean} Success status
   */
  unregisterElement(element) {
    try {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;

      if (!el) {
        return false;
      }

      const system = this.registeredElements.get(el);
      if (system) {
        // Remove event handlers
        this.removeEventHandlers(el);

        // Remove from registry
        this.registeredElements.delete(el);

        logger.info(
          "ChartEventCoordinator",
          `Unregistered element from ${system}`,
          {
            elementId: el.id || "no-id",
          },
        );
      }

      return true;
    } catch (error) {
      logger.error(
        "ChartEventCoordinator",
        "Failed to unregister element",
        error,
      );
      return false;
    }
  }

  /**
   * Add event handler with conflict prevention
   * @param {HTMLElement} element - DOM element
   * @param {string} eventType - Event type (click, mouseover, etc.)
   * @param {Function} handler - Event handler function
   * @param {Object} options - Event options
   * @returns {boolean} Success status
   */
  addEventHandler(element, eventType, handler, options = {}) {
    try {
      const system = this.registeredElements.get(element);
      if (!system) {
        logger.warn(
          "ChartEventCoordinator",
          "Element not registered with any chart system",
        );
        return false;
      }

      // Remove any existing handlers for this event type
      this.removeEventHandler(element, eventType);

      // Create handler with system context
      const wrappedHandler = (event) => {
        // Add system context to event
        event.chartSystem = system;
        event.stopChartPropagation = () => {
          event.stopPropagation();
          event.preventDefault();
        };

        return handler(event);
      };

      // Store handler for cleanup
      if (!this.activeEventHandlers.has(element)) {
        this.activeEventHandlers.set(element, new Map());
      }
      this.activeEventHandlers.get(element).set(eventType, wrappedHandler);

      // Add event listener
      element.addEventListener(eventType, wrappedHandler, options);

      logger.debug(
        "ChartEventCoordinator",
        `Added ${eventType} handler for ${system}`,
        {
          elementId: element.id || "no-id",
          system,
        },
      );

      return true;
    } catch (error) {
      logger.error(
        "ChartEventCoordinator",
        "Failed to add event handler",
        error,
      );
      return false;
    }
  }

  /**
   * Remove specific event handler
   * @param {HTMLElement} element - DOM element
   * @param {string} eventType - Event type
   * @returns {boolean} Success status
   */
  removeEventHandler(element, eventType) {
    try {
      const elementHandlers = this.activeEventHandlers.get(element);
      if (!elementHandlers) {
        return false;
      }

      const handler = elementHandlers.get(eventType);
      if (handler) {
        element.removeEventListener(eventType, handler);
        elementHandlers.delete(eventType);

        // Clean up empty maps
        if (elementHandlers.size === 0) {
          this.activeEventHandlers.delete(element);
        }

        logger.debug("ChartEventCoordinator", `Removed ${eventType} handler`, {
          elementId: element.id || "no-id",
        });

        return true;
      }

      return false;
    } catch (error) {
      logger.error(
        "ChartEventCoordinator",
        "Failed to remove event handler",
        error,
      );
      return false;
    }
  }

  /**
   * Remove all event handlers for an element
   * @param {HTMLElement} element - DOM element
   */
  removeEventHandlers(element) {
    const elementHandlers = this.activeEventHandlers.get(element);
    if (elementHandlers) {
      for (const [eventType, handler] of elementHandlers) {
        element.removeEventListener(eventType, handler);
      }
      this.activeEventHandlers.delete(element);
    }
  }

  /**
   * Get chart system for element
   * @param {HTMLElement|string} element - DOM element or selector
   * @returns {string|null} System identifier or null
   */
  getElementSystem(element) {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;
    return el ? this.registeredElements.get(el) || null : null;
  }

  /**
   * Check if element is registered
   * @param {HTMLElement|string} element - DOM element or selector
   * @returns {boolean} Registration status
   */
  isElementRegistered(element) {
    const el =
      typeof element === "string" ? document.querySelector(element) : element;
    return el ? this.registeredElements.has(el) : false;
  }

  /**
   * Get all instances for a system
   * @param {string} system - System identifier
   * @returns {Set} Set of instances
   */
  getSystemInstances(system) {
    return this.systemInstances.get(system) || new Set();
  }

  /**
   * Clean up orphaned elements (DOM elements that no longer exist)
   */
  cleanupOrphanedElements() {
    const orphaned = [];

    for (const [element, system] of this.registeredElements) {
      if (!document.contains(element)) {
        orphaned.push({ element, system });
      }
    }

    for (const { element, system } of orphaned) {
      logger.info(
        "ChartEventCoordinator",
        `Cleaning up orphaned element from ${system}`,
      );
      this.unregisterElement(element);
    }

    return orphaned.length;
  }

  /**
   * Get coordination status report
   * @returns {Object} Status report
   */
  getStatus() {
    const systemCounts = {};
    for (const [system, instances] of this.systemInstances) {
      systemCounts[system] = instances.size;
    }

    return {
      totalElements: this.registeredElements.size,
      totalHandlers: Array.from(this.activeEventHandlers.values()).reduce(
        (total, handlers) => total + handlers.size,
        0,
      ),
      systemCounts,
      registeredSystems: Array.from(this.systemInstances.keys()),
    };
  }

  /**
   * Emergency cleanup - remove all registrations and handlers
   */
  emergencyCleanup() {
    logger.warn("ChartEventCoordinator", "Performing emergency cleanup");

    // Remove all event handlers
    for (const [element] of this.activeEventHandlers) {
      this.removeEventHandlers(element);
    }

    // Clear all registrations
    this.registeredElements.clear();
    this.activeEventHandlers.clear();
    this.systemInstances.clear();

    logger.info("ChartEventCoordinator", "Emergency cleanup completed");
  }
}

// Create singleton instance
const chartEventCoordinator = new ChartEventCoordinator();

// Global cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    chartEventCoordinator.emergencyCleanup();
  });

  // Make available for debugging
  window.debugChartEventCoordinator = chartEventCoordinator;
}

export default chartEventCoordinator;
