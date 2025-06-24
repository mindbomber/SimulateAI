/**
 * Scene - Container and manager for all visual objects in the simulation
 * Handles object hierarchy, updates, and spatial queries
 */

export class Scene {
    constructor() {
        this.objects = [];
        this.interactiveObjects = [];
        this.layers = new Map(); // For z-index management
        this.background = null;
        this.camera = null;
        
        // Spatial optimization (for future implementation)
        this.spatialGrid = null;
        this.needsSpatialUpdate = false;
        
        // Object pools for performance
        this.objectPools = new Map();
    }

    add(object) {
        if (!object) return;
        
        // Set scene reference
        object.scene = this;
        
        // Add to main objects array
        this.objects.push(object);
        
        // Add to interactive objects if applicable
        if (object.isInteractive) {
            this.interactiveObjects.push(object);
        }
        
        // Handle layering
        if (object.layer !== undefined) {
            this.addToLayer(object, object.layer);
        }
        
        // Mark for spatial update
        this.needsSpatialUpdate = true;
        
        // Call object's onAdded callback if it exists
        if (object.onAdded) {
            object.onAdded(this);
        }
        
        return object;
    }

    remove(object) {
        if (!object) return;
        
        // Remove from main objects array
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
        
        // Remove from interactive objects
        const interactiveIndex = this.interactiveObjects.indexOf(object);
        if (interactiveIndex > -1) {
            this.interactiveObjects.splice(interactiveIndex, 1);
        }
        
        // Remove from layers
        if (object.layer !== undefined) {
            this.removeFromLayer(object, object.layer);
        }
        
        // Clear scene reference
        object.scene = null;
        
        // Mark for spatial update
        this.needsSpatialUpdate = true;
        
        // Call object's onRemoved callback if it exists
        if (object.onRemoved) {
            object.onRemoved();
        }
        
        return object;
    }

    addToLayer(object, layerIndex) {
        if (!this.layers.has(layerIndex)) {
            this.layers.set(layerIndex, []);
        }
        
        const layer = this.layers.get(layerIndex);
        if (!layer.includes(object)) {
            layer.push(object);
            
            // Sort layer by z-index if objects have it
            layer.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        }
    }

    removeFromLayer(object, layerIndex) {
        if (this.layers.has(layerIndex)) {
            const layer = this.layers.get(layerIndex);
            const index = layer.indexOf(object);
            if (index > -1) {
                layer.splice(index, 1);
            }
        }
    }

    clear() {
        // Call onRemoved for all objects
        this.objects.forEach(object => {
            if (object.onRemoved) {
                object.onRemoved();
            }
            object.scene = null;
        });
        
        this.objects = [];
        this.interactiveObjects = [];
        this.layers.clear();
        this.background = null;
        this.needsSpatialUpdate = true;
    }

    update(deltaTime) {
        // Update all objects
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const object = this.objects[i];
            
            if (object.update) {
                object.update(deltaTime);
            }
            
            // Remove objects marked for deletion
            if (object.markedForDeletion) {
                this.remove(object);
            }
        }
        
        // Update spatial grid if needed
        if (this.needsSpatialUpdate && this.spatialGrid) {
            this.updateSpatialGrid();
            this.needsSpatialUpdate = false;
        }
    }

    render(renderer) {
        // Render background first
        if (this.background) {
            renderer.renderObject(this.background);
        }
        
        // Render objects by layers (if using layers) or by z-index
        if (this.layers.size > 0) {
            this.renderByLayers(renderer);
        } else {
            this.renderByZIndex(renderer);
        }
    }

    renderByLayers(renderer) {
        // Get sorted layer indices
        const layerIndices = Array.from(this.layers.keys()).sort((a, b) => a - b);
        
        layerIndices.forEach(layerIndex => {
            const layer = this.layers.get(layerIndex);
            layer.forEach(object => {
                if (object.visible !== false) {
                    renderer.renderObject(object);
                }
            });
        });
        
        // Render objects not in any layer
        this.objects.forEach(object => {
            if (object.layer === undefined && object.visible !== false) {
                renderer.renderObject(object);
            }
        });
    }

    renderByZIndex(renderer) {
        // Create sorted copy of objects by z-index
        const sortedObjects = [...this.objects].sort((a, b) => 
            (a.zIndex || 0) - (b.zIndex || 0)
        );
        
        sortedObjects.forEach(object => {
            if (object.visible !== false) {
                renderer.renderObject(object);
            }
        });
    }

    // Spatial queries
    getObjectsAt(x, y) {
        const results = [];
        
        // Check interactive objects first (reverse order for top-to-bottom hit testing)
        for (let i = this.interactiveObjects.length - 1; i >= 0; i--) {
            const object = this.interactiveObjects[i];
            
            if (object.visible !== false && object.containsPoint && object.containsPoint(x, y)) {
                results.push(object);
            }
        }
        
        return results;
    }

    getObjectsInArea(x, y, width, height) {
        const results = [];
        const area = { x, y, width, height };
        
        this.objects.forEach(object => {
            if (object.visible !== false && object.getBounds) {
                const bounds = object.getBounds();
                if (this.rectanglesIntersect(area, bounds)) {
                    results.push(object);
                }
            }
        });
        
        return results;
    }

    getObjectsByType(type) {
        return this.objects.filter(object => object.type === type);
    }

    getObjectsByTag(tag) {
        return this.objects.filter(object => 
            object.tags && object.tags.includes(tag)
        );
    }

    findObject(predicate) {
        return this.objects.find(predicate);
    }

    findObjects(predicate) {
        return this.objects.filter(predicate);
    }

    // Hit testing with detailed information
    hitTest(x, y, options = {}) {
        const {
            includeNonInteractive = false,
            layer = null,
            type = null
        } = options;
        
        let objectsToTest = includeNonInteractive ? this.objects : this.interactiveObjects;
        
        // Filter by layer if specified
        if (layer !== null) {
            objectsToTest = objectsToTest.filter(obj => obj.layer === layer);
        }
        
        // Filter by type if specified
        if (type !== null) {
            objectsToTest = objectsToTest.filter(obj => obj.type === type);
        }
        
        // Test objects in reverse order (top to bottom)
        for (let i = objectsToTest.length - 1; i >= 0; i--) {
            const object = objectsToTest[i];
            
            if (object.visible !== false && object.containsPoint) {
                const localPoint = this.worldToLocal(object, x, y);
                if (object.containsPoint(localPoint.x, localPoint.y)) {
                    return {
                        object,
                        worldPoint: { x, y },
                        localPoint,
                        distance: this.getDistance(x, y, object.x || 0, object.y || 0)
                    };
                }
            }
        }
        
        return null;
    }

    // Coordinate transformations
    worldToLocal(object, worldX, worldY) {
        // Basic transformation - can be extended for complex transforms
        return {
            x: worldX - (object.x || 0),
            y: worldY - (object.y || 0)
        };
    }

    localToWorld(object, localX, localY) {
        return {
            x: localX + (object.x || 0),
            y: localY + (object.y || 0)
        };
    }

    // Utility methods
    rectanglesIntersect(rect1, rect2) {
        return !(rect2.x > rect1.x + rect1.width || 
                rect2.x + rect2.width < rect1.x || 
                rect2.y > rect1.y + rect1.height ||
                rect2.y + rect2.height < rect1.y);
    }

    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Event handling
    handleInput(eventType, eventData) {
        // Handle input events in reverse order (top-to-bottom hit testing)
        const objects = [...this.interactiveObjects].reverse();
        
        for (const object of objects) {
            if (object.visible === false) continue;
            
            // Check if object can handle this input type
            if (object.handleInput && object.handleInput(eventType, eventData)) {
                // Input was consumed, stop propagation
                return true;
            }
            
            // For mouse/touch events, check if point is within object bounds
            if ((eventType.includes('mouse') || eventType.includes('touch')) && 
                eventData.x !== undefined && eventData.y !== undefined) {
                
                if (object.containsPoint && object.containsPoint(eventData.x, eventData.y)) {
                    // Trigger object-specific events
                    if (eventType === 'mousedown' && object.onMouseDown) {
                        object.onMouseDown(eventData);
                        return true;
                    } else if (eventType === 'mouseup' && object.onClick) {
                        object.onClick(eventData);
                        return true;
                    } else if (eventType === 'mousemove' && object.onMouseMove) {
                        object.onMouseMove(eventData);
                        return true;
                    }
                }
            }
        }
        
        return false; // Input not consumed
    }

    handleResize() {
        // Notify all objects of resize
        this.objects.forEach(object => {
            if (object.onResize) {
                object.onResize();
            }
        });
    }

    // Animation and tweening support
    animateObject(object, properties, duration, options = {}) {
        if (!object || !properties || duration <= 0) return;
        
        const {
            easing = 'easeInOut',
            onComplete = null,
            onUpdate = null
        } = options;
        
        const startTime = performance.now();
        const startValues = {};
        
        // Store initial values
        Object.keys(properties).forEach(key => {
            startValues[key] = object[key] || 0;
        });
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Apply easing
            const easedProgress = this.applyEasing(progress, easing);
            
            // Update object properties
            Object.keys(properties).forEach(key => {
                const startValue = startValues[key];
                const endValue = properties[key];
                object[key] = startValue + (endValue - startValue) * easedProgress;
            });
            
            if (onUpdate) {
                onUpdate(object, easedProgress);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete(object);
            }
        };
        
        requestAnimationFrame(animate);
    }

    applyEasing(t, type) {
        switch (type) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            case 'bounce':
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            default:
                return t;
        }
    }

    // Performance and debugging
    getStats() {
        return {
            totalObjects: this.objects.length,
            interactiveObjects: this.interactiveObjects.length,
            layers: this.layers.size,
            needsSpatialUpdate: this.needsSpatialUpdate
        };
    }

    // Future: Spatial grid implementation for optimization
    updateSpatialGrid() {
        // TODO: Implement spatial partitioning for large numbers of objects
        // This would significantly improve performance for collision detection
        // and spatial queries in complex simulations
    }
}

export default Scene;
