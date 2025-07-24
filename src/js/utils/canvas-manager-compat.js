/**
 * Canvas Manager Compatibility Layer
 *
 * Provides backwards compatibility for code that uses canvas-manager
 * while internally using the consolidated CanvasRenderer
 *
 * This file serves as a bridge during the consolidation process
 */

import CanvasRenderer from "../renderers/canvas-renderer.js";
import logger from "./logger.js";

/**
 * Compatibility wrapper for canvas manager functionality
 */
class CanvasManagerCompat {
  constructor() {
    this.renderers = new Map();
    this.nextId = 1;
  }

  /**
   * Create canvas using consolidated renderer
   * @param {Object} options - Canvas options
   * @returns {Object} Canvas element and ID
   */
  async createCanvas(options = {}) {
    try {
      const {
        width = 400,
        height = 300,
        id = null,
        container = null,
        className = "managed-canvas",
        ariaLabel = "Interactive canvas element",
      } = options;

      // Generate unique ID if not provided
      const canvasId = id || `managed-canvas-${this.nextId++}`;

      // Check if canvas already exists
      if (this.renderers.has(canvasId)) {
        logger.warn(
          `Canvas with ID ${canvasId} already exists. Returning existing canvas.`,
        );
        const existingRenderer = this.renderers.get(canvasId);
        return { canvas: existingRenderer.getElement(), id: canvasId };
      }

      // Create canvas element first (CanvasRenderer expects a container)
      const tempContainer = container || document.createElement("div");
      if (!container) {
        document.body.appendChild(tempContainer);
      }

      // Create renderer with consolidated system
      const renderer = new CanvasRenderer(tempContainer, {
        width,
        height,
        enableAccessibility: true,
        enablePerformanceMonitoring: true,
      });

      const canvas = renderer.getElement();

      // Apply requested properties
      if (className) {
        canvas.className = className;
      }

      if (ariaLabel) {
        canvas.setAttribute("aria-label", ariaLabel);
      }

      // Store renderer reference
      this.renderers.set(canvasId, renderer);

      return { canvas, id: canvasId };
    } catch (error) {
      logger.error("Failed to create canvas:", error);
      throw error;
    }
  }

  /**
   * Create visual engine (returns the renderer itself as the engine)
   * @param {string} canvasId - Canvas ID
   * @param {Object} engineOptions - Engine options
   * @returns {CanvasRenderer} The canvas renderer as visual engine
   */
  async createVisualEngine(canvasId, engineOptions = {}) {
    try {
      const renderer = this.renderers.get(canvasId);

      if (!renderer) {
        throw new Error(`Canvas with ID ${canvasId} not found`);
      }

      // The consolidated renderer already has all visual engine capabilities
      // so we can return it directly as the engine
      return renderer;
    } catch (error) {
      logger.error("Failed to create visual engine:", error);
      throw error;
    }
  }

  /**
   * Remove canvas and clean up resources
   * @param {string} canvasId - Canvas ID to remove
   */
  async removeCanvas(canvasId) {
    try {
      const renderer = this.renderers.get(canvasId);

      if (renderer) {
        // Use the consolidated renderer's cleanup
        renderer.destroy();
        this.renderers.delete(canvasId);
        logger.debug(`Canvas ${canvasId} removed successfully`);
      } else {
        logger.warn(`Canvas with ID ${canvasId} not found for removal`);
      }
    } catch (error) {
      logger.error("Failed to remove canvas:", error);
    }
  }

  /**
   * Get renderer by canvas ID
   * @param {string} canvasId - Canvas ID
   * @returns {CanvasRenderer|null} Renderer or null if not found
   */
  getRenderer(canvasId) {
    return this.renderers.get(canvasId) || null;
  }

  /**
   * Get canvas element by ID
   * @param {string} canvasId - Canvas ID
   * @returns {HTMLCanvasElement|null} Canvas element or null if not found
   */
  getCanvas(canvasId) {
    const renderer = this.renderers.get(canvasId);
    return renderer ? renderer.getElement() : null;
  }

  /**
   * Clean up all canvases
   */
  cleanup() {
    for (const [id, renderer] of this.renderers) {
      try {
        renderer.destroy();
      } catch (error) {
        logger.error(`Error cleaning up canvas ${id}:`, error);
      }
    }
    this.renderers.clear();
  }
}

// Create singleton instance
const canvasManagerCompat = new CanvasManagerCompat();

export default canvasManagerCompat;
