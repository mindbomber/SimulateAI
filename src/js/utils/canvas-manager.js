/**
 * Canvas Manager - Centralized canvas and visual engine management
 * Prevents conflicts between multiple canvas elements and visual engines
 */

class CanvasManager {
    constructor() {
        this.canvases = new Map();
        this.visualEngines = new Map();
        this.activeEngines = new Set();
        this.nextId = 1;
    }

    /**
     * Create a managed canvas with unique ID
     */
    createCanvas(options = {}) {
        const {
            width = 400,
            height = 300,
            id = null,
            container = null,
            className = 'managed-canvas'
        } = options;

        // Generate unique ID if not provided
        const canvasId = id || `managed-canvas-${this.nextId++}`;
          // Check if canvas already exists
        if (this.canvases.has(canvasId)) {
            console.warn(`Canvas with ID ${canvasId} already exists. Returning existing canvas.`);
            const existingCanvasData = this.canvases.get(canvasId);
            return { canvas: existingCanvasData.element, id: canvasId };
        }

        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        canvas.width = width;
        canvas.height = height;
        canvas.className = className;
        
        // Store canvas reference
        this.canvases.set(canvasId, {
            element: canvas,
            created: Date.now(),
            options: { ...options }
        });

        // Append to container if provided
        if (container) {
            container.appendChild(canvas);
        }

        console.log(`Created managed canvas: ${canvasId}`);
        return { canvas, id: canvasId };
    }

    /**
     * Create a visual engine for a specific canvas
     */
    async createVisualEngine(canvasId, engineOptions = {}) {
        const canvasData = this.canvases.get(canvasId);
        if (!canvasData) {
            throw new Error(`Canvas ${canvasId} not found. Create canvas first.`);
        }

        // Check if engine already exists for this canvas
        if (this.visualEngines.has(canvasId)) {
            console.warn(`Visual engine for ${canvasId} already exists. Returning existing engine.`);
            return this.visualEngines.get(canvasId);
        }

        try {
            // Import visual engine dynamically to avoid circular dependencies
            const VisualEngine = await import('../core/visual-engine.js');
            
            const engine = new VisualEngine.default(canvasData.element, {
                renderMode: 'canvas',
                accessibility: true,
                debug: false,
                ...engineOptions
            });

            // Store engine reference
            this.visualEngines.set(canvasId, engine);
            this.activeEngines.add(canvasId);

            console.log(`Created visual engine for canvas: ${canvasId}`);
            return engine;
        } catch (error) {
            console.error(`Failed to create visual engine for ${canvasId}:`, error);
            throw error;
        }
    }

    /**
     * Get canvas element by ID
     */
    getCanvas(canvasId) {
        const canvasData = this.canvases.get(canvasId);
        return canvasData ? canvasData.element : null;
    }

    /**
     * Get visual engine by canvas ID
     */
    getVisualEngine(canvasId) {
        return this.visualEngines.get(canvasId);
    }

    /**
     * Remove canvas and cleanup associated resources
     */
    removeCanvas(canvasId) {
        // Cleanup visual engine first
        this.removeVisualEngine(canvasId);

        // Remove canvas from DOM and storage
        const canvasData = this.canvases.get(canvasId);
        if (canvasData) {
            if (canvasData.element.parentNode) {
                canvasData.element.parentNode.removeChild(canvasData.element);
            }
            this.canvases.delete(canvasId);
            console.log(`Removed canvas: ${canvasId}`);
        }
    }

    /**
     * Remove visual engine and cleanup resources
     */
    removeVisualEngine(canvasId) {
        const engine = this.visualEngines.get(canvasId);
        if (engine) {
            try {
                // Cleanup engine resources
                if (engine.destroy) {
                    engine.destroy();
                } else if (engine.cleanup) {
                    engine.cleanup();
                }
                
                // Clear scene if it exists
                if (engine.scene && engine.scene.clear) {
                    engine.scene.clear();
                }
                
            } catch (error) {
                console.warn(`Error cleaning up visual engine ${canvasId}:`, error);
            }

            this.visualEngines.delete(canvasId);
            this.activeEngines.delete(canvasId);
            console.log(`Removed visual engine: ${canvasId}`);
        }
    }

    /**
     * Cleanup all canvases and engines
     */
    cleanup() {
        // Remove all visual engines
        for (const canvasId of this.visualEngines.keys()) {
            this.removeVisualEngine(canvasId);
        }

        // Remove all canvases
        for (const canvasId of this.canvases.keys()) {
            this.removeCanvas(canvasId);
        }

        console.log('Canvas manager cleanup complete');
    }

    /**
     * Pause all active visual engines
     */
    pauseAll() {
        this.activeEngines.forEach(canvasId => {
            const engine = this.visualEngines.get(canvasId);
            if (engine && engine.pause) {
                engine.pause();
            }
        });
    }

    /**
     * Resume all active visual engines
     */
    resumeAll() {
        this.activeEngines.forEach(canvasId => {
            const engine = this.visualEngines.get(canvasId);
            if (engine && engine.resume) {
                engine.resume();
            }
        });
    }

    /**
     * Get status of all managed canvases and engines
     */
    getStatus() {
        return {
            canvases: Array.from(this.canvases.keys()),
            visualEngines: Array.from(this.visualEngines.keys()),
            activeEngines: Array.from(this.activeEngines),
            totalCanvases: this.canvases.size,
            totalEngines: this.visualEngines.size
        };
    }

    /**
     * Resize canvas and notify visual engine
     */
    resizeCanvas(canvasId, width, height) {
        const canvas = this.getCanvas(canvasId);
        const engine = this.getVisualEngine(canvasId);

        if (canvas) {
            canvas.width = width;
            canvas.height = height;
            
            // Notify engine of resize
            if (engine && engine.resize) {
                engine.resize(width, height);
            }

            console.log(`Resized canvas ${canvasId} to ${width}x${height}`);
        }
    }

    /**
     * Check if canvas is responsive and handle resize
     */
    makeResponsive(canvasId) {
        const canvas = this.getCanvas(canvasId);
        if (!canvas) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                this.resizeCanvas(canvasId, width, height);
            }
        });

        resizeObserver.observe(canvas.parentElement || canvas);
        
        // Store observer for cleanup
        const canvasData = this.canvases.get(canvasId);
        if (canvasData) {
            canvasData.resizeObserver = resizeObserver;
        }
    }
}

// Create global instance
const canvasManager = new CanvasManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    canvasManager.cleanup();
});

export default canvasManager;
