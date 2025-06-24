/**
 * Animation Manager - Handles all animations and tweening for the Visual Engine
 * Provides smooth interpolation, easing functions, and timeline management
 */

export class AnimationManager {
    constructor(engine) {
        this.engine = engine;
        this.animations = new Map();
        this.timelines = new Map();
        this.activeAnimations = new Set();
        this.animationId = 0;
        
        // Performance settings
        this.maxAnimationsPerFrame = 50;
        this.frameTimeLimit = 16; // ~60 FPS
        
        console.log('AnimationManager: Initialized');
    }

    // Main animation methods
    animate(target, properties, duration = 1000, options = {}) {
        if (!target || !properties || duration <= 0) {
            console.warn('Invalid animation parameters');
            return null;
        }

        const animation = {
            id: ++this.animationId,
            target,
            properties: this.processProperties(target, properties),
            duration,
            startTime: performance.now(),
            elapsed: 0,
            progress: 0,
            
            // Options
            easing: options.easing || 'easeInOut',
            delay: options.delay || 0,
            repeat: options.repeat || 0,
            yoyo: options.yoyo || false,
            onStart: options.onStart || null,
            onUpdate: options.onUpdate || null,
            onComplete: options.onComplete || null,
            onRepeat: options.onRepeat || null,
            
            // State
            started: false,
            completed: false,
            paused: false,
            repeatCount: 0,
            direction: 1 // 1 for forward, -1 for reverse (yoyo)
        };

        this.animations.set(animation.id, animation);
        this.activeAnimations.add(animation.id);

        return animation.id;
    }

    // Tween to specific values
    to(target, properties, duration, options = {}) {
        return this.animate(target, properties, duration, options);
    }

    // Tween from specific values
    from(target, properties, duration, options = {}) {
        // Set the starting values, then animate to current values
        const endValues = {};
        Object.keys(properties).forEach(key => {
            endValues[key] = target[key] || 0;
            target[key] = properties[key];
        });
        
        return this.animate(target, endValues, duration, options);
    }

    // Timeline management
    createTimeline(options = {}) {
        const timeline = {
            id: ++this.animationId,
            animations: [],
            duration: 0,
            startTime: 0,
            elapsed: 0,
            progress: 0,
            
            // Options
            repeat: options.repeat || 0,
            yoyo: options.yoyo || false,
            onStart: options.onStart || null,
            onUpdate: options.onUpdate || null,
            onComplete: options.onComplete || null,
            
            // State
            started: false,
            completed: false,
            paused: false
        };

        this.timelines.set(timeline.id, timeline);
        return timeline.id;
    }

    // Add animation to timeline
    addToTimeline(timelineId, target, properties, duration, delay = 0, options = {}) {
        const timeline = this.timelines.get(timelineId);
        if (!timeline) return null;

        const animation = {
            target,
            properties: this.processProperties(target, properties),
            duration,
            delay,
            easing: options.easing || 'easeInOut',
            onStart: options.onStart || null,
            onUpdate: options.onUpdate || null,
            onComplete: options.onComplete || null,
            started: false,
            completed: false
        };

        timeline.animations.push(animation);
        timeline.duration = Math.max(timeline.duration, delay + duration);

        return animation;
    }

    // Play timeline
    playTimeline(timelineId) {
        const timeline = this.timelines.get(timelineId);
        if (!timeline) return;

        timeline.startTime = performance.now();
        timeline.started = true;
        timeline.completed = false;
        
        if (timeline.onStart) {
            timeline.onStart(timeline);
        }
    }

    // Control methods
    pause(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            animation.paused = true;
        }
    }

    resume(animationId) {
        const animation = this.animations.get(animationId);
        if (animation && animation.paused) {
            animation.paused = false;
            // Adjust start time to account for pause duration
            const now = performance.now();
            animation.startTime = now - animation.elapsed;
        }
    }

    stop(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            animation.completed = true;
            this.activeAnimations.delete(animationId);
        }
    }

    stopAll() {
        this.activeAnimations.forEach(id => this.stop(id));
    }

    // Update method (called by engine)
    update(deltaTime) {
        const frameStart = performance.now();
        let processedCount = 0;

        // Update active animations
        for (const animationId of this.activeAnimations) {
            if (processedCount >= this.maxAnimationsPerFrame || 
                (performance.now() - frameStart) > this.frameTimeLimit) {
                break;
            }

            const animation = this.animations.get(animationId);
            if (animation && !animation.paused) {
                this.updateAnimation(animation, deltaTime);
                processedCount++;
            }
        }

        // Update timelines
        this.timelines.forEach(timeline => {
            if (timeline.started && !timeline.completed && !timeline.paused) {
                this.updateTimeline(timeline, deltaTime);
            }
        });

        // Clean up completed animations
        this.cleanupCompleted();
    }

    updateAnimation(animation, deltaTime) {
        const now = performance.now();
        
        // Handle delay
        if (!animation.started) {
            if (now - animation.startTime >= animation.delay) {
                animation.started = true;
                animation.startTime = now;
                
                if (animation.onStart) {
                    animation.onStart(animation.target, animation);
                }
            } else {
                return;
            }
        }

        // Calculate progress
        animation.elapsed = now - animation.startTime;
        animation.progress = Math.min(animation.elapsed / animation.duration, 1);

        // Apply easing
        const easedProgress = this.applyEasing(animation.progress, animation.easing);

        // Update properties
        this.updateProperties(animation, easedProgress);

        // Call update callback
        if (animation.onUpdate) {
            animation.onUpdate(animation.target, animation.progress, animation);
        }

        // Handle completion
        if (animation.progress >= 1) {
            this.handleAnimationComplete(animation);
        }
    }

    updateTimeline(timeline, deltaTime) {
        const now = performance.now();
        timeline.elapsed = now - timeline.startTime;
        timeline.progress = Math.min(timeline.elapsed / timeline.duration, 1);

        // Update timeline animations
        timeline.animations.forEach(animation => {
            const animationStart = timeline.startTime + animation.delay;
            const animationEnd = animationStart + animation.duration;

            if (now >= animationStart && now <= animationEnd && !animation.completed) {
                if (!animation.started) {
                    animation.started = true;
                    if (animation.onStart) {
                        animation.onStart(animation.target, animation);
                    }
                }

                const animationProgress = Math.min((now - animationStart) / animation.duration, 1);
                const easedProgress = this.applyEasing(animationProgress, animation.easing);
                
                this.updateProperties(animation, easedProgress);
                
                if (animation.onUpdate) {
                    animation.onUpdate(animation.target, animationProgress, animation);
                }

                if (animationProgress >= 1 && !animation.completed) {
                    animation.completed = true;
                    if (animation.onComplete) {
                        animation.onComplete(animation.target, animation);
                    }
                }
            }
        });

        // Handle timeline completion
        if (timeline.progress >= 1) {
            timeline.completed = true;
            if (timeline.onComplete) {
                timeline.onComplete(timeline);
            }
        }
    }

    handleAnimationComplete(animation) {
        if (animation.repeat > 0 || animation.repeat === -1) {
            // Handle repeat
            animation.repeatCount++;
            
            if (animation.repeat === -1 || animation.repeatCount < animation.repeat) {
                if (animation.yoyo) {
                    animation.direction *= -1;
                    // Swap start and end values for yoyo effect
                    Object.keys(animation.properties).forEach(key => {
                        const prop = animation.properties[key];
                        [prop.start, prop.end] = [prop.end, prop.start];
                    });
                }
                
                animation.startTime = performance.now();
                animation.elapsed = 0;
                animation.progress = 0;
                
                if (animation.onRepeat) {
                    animation.onRepeat(animation.target, animation.repeatCount, animation);
                }
                
                return;
            }
        }

        // Animation fully completed
        animation.completed = true;
        this.activeAnimations.delete(animation.id);
        
        if (animation.onComplete) {
            animation.onComplete(animation.target, animation);
        }
    }

    updateProperties(animation, progress) {
        Object.keys(animation.properties).forEach(key => {
            const prop = animation.properties[key];
            
            if (prop.type === 'number') {
                animation.target[key] = prop.start + (prop.end - prop.start) * progress;
            } else if (prop.type === 'color') {
                animation.target[key] = this.interpolateColor(prop.start, prop.end, progress);
            } else if (prop.type === 'transform') {
                animation.target[key] = this.interpolateTransform(prop.start, prop.end, progress);
            }
        });
    }

    processProperties(target, properties) {
        const processed = {};
        
        Object.keys(properties).forEach(key => {
            const endValue = properties[key];
            const startValue = target[key] || 0;
            
            if (typeof endValue === 'number') {
                processed[key] = {
                    type: 'number',
                    start: startValue,
                    end: endValue
                };
            } else if (this.isColor(endValue)) {
                processed[key] = {
                    type: 'color',
                    start: this.parseColor(startValue),
                    end: this.parseColor(endValue)
                };
            } else if (typeof endValue === 'string' && endValue.includes('transform')) {
                processed[key] = {
                    type: 'transform',
                    start: startValue,
                    end: endValue
                };
            } else {
                // Fallback to number
                processed[key] = {
                    type: 'number',
                    start: parseFloat(startValue) || 0,
                    end: parseFloat(endValue) || 0
                };
            }
        });
        
        return processed;
    }

    // Easing functions
    applyEasing(progress, easingName) {
        const easings = {
            linear: t => t,
            easeIn: t => t * t,
            easeOut: t => t * (2 - t),
            easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
            easeOutSine: t => Math.sin(t * Math.PI / 2),
            easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
            bounce: t => {
                if (t < 1 / 2.75) return 7.5625 * t * t;
                if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            },
            elastic: t => {
                if (t === 0) return 0;
                if (t === 1) return 1;
                return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * (2 * Math.PI) / 0.4) + 1;
            }
        };

        const easingFunc = easings[easingName] || easings.linear;
        return easingFunc(progress);
    }

    // Color interpolation
    isColor(value) {
        return typeof value === 'string' && (
            value.startsWith('#') || 
            value.startsWith('rgb') || 
            value.startsWith('hsl')
        );
    }

    parseColor(color) {
        if (typeof color !== 'string') return { r: 0, g: 0, b: 0, a: 1 };
        
        // Simple hex color parsing
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            if (hex.length === 3) {
                return {
                    r: parseInt(hex[0] + hex[0], 16),
                    g: parseInt(hex[1] + hex[1], 16),
                    b: parseInt(hex[2] + hex[2], 16),
                    a: 1
                };
            } else if (hex.length === 6) {
                return {
                    r: parseInt(hex.slice(0, 2), 16),
                    g: parseInt(hex.slice(2, 4), 16),
                    b: parseInt(hex.slice(4, 6), 16),
                    a: 1
                };
            }
        }
        
        // RGB parsing would go here
        return { r: 0, g: 0, b: 0, a: 1 };
    }

    interpolateColor(start, end, progress) {
        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        const a = start.a + (end.a - start.a) * progress;
        
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    interpolateTransform(start, end, progress) {
        // Basic transform interpolation
        // In a real implementation, this would parse and interpolate transform strings
        return progress < 0.5 ? start : end;
    }

    // Utility methods
    cleanupCompleted() {
        const toDelete = [];
        
        this.animations.forEach((animation, id) => {
            if (animation.completed) {
                toDelete.push(id);
            }
        });
        
        toDelete.forEach(id => {
            this.animations.delete(id);
            this.activeAnimations.delete(id);
        });
        
        // Clean up completed timelines
        const timelinesToDelete = [];
        this.timelines.forEach((timeline, id) => {
            if (timeline.completed) {
                timelinesToDelete.push(id);
            }
        });
        
        timelinesToDelete.forEach(id => {
            this.timelines.delete(id);
        });
    }

    getActiveAnimationCount() {
        return this.activeAnimations.size;
    }

    getActiveTimelineCount() {
        return Array.from(this.timelines.values()).filter(t => t.started && !t.completed).length;
    }

    // Preset animations
    fadeIn(target, duration = 500, options = {}) {
        target.opacity = target.opacity || 0;
        return this.to(target, { opacity: 1 }, duration, options);
    }

    fadeOut(target, duration = 500, options = {}) {
        return this.to(target, { opacity: 0 }, duration, options);
    }

    slideIn(target, direction = 'left', distance = 100, duration = 500, options = {}) {
        const startPos = direction === 'left' ? -distance : 
                        direction === 'right' ? distance :
                        direction === 'up' ? -distance : distance;
                        
        const property = direction === 'left' || direction === 'right' ? 'x' : 'y';
        const endPos = target[property] || 0;
        
        target[property] = startPos;
        return this.to(target, { [property]: endPos }, duration, options);
    }

    scale(target, scale = 1.2, duration = 300, options = {}) {
        const originalScale = target.scale || 1;
        return this.to(target, { scale }, duration, {
            ...options,
            yoyo: true,
            onComplete: () => {
                target.scale = originalScale;
                if (options.onComplete) options.onComplete();
            }
        });
    }

    shake(target, intensity = 5, duration = 500, options = {}) {
        const originalX = target.x || 0;
        const shakeCount = 10;
        const shakeDistance = intensity;
        
        const timeline = this.createTimeline();
        
        for (let i = 0; i < shakeCount; i++) {
            const direction = i % 2 === 0 ? 1 : -1;
            const x = originalX + (direction * shakeDistance);
            
            this.addToTimeline(timeline, target, { x }, duration / shakeCount, i * (duration / shakeCount));
        }
        
        // Return to original position
        this.addToTimeline(timeline, target, { x: originalX }, duration / shakeCount, duration - (duration / shakeCount));
        
        this.playTimeline(timeline);
        return timeline;
    }

    // Cleanup
    destroy() {
        this.stopAll();
        this.animations.clear();
        this.timelines.clear();
        this.activeAnimations.clear();
        
        console.log('AnimationManager: Destroyed');
    }
}

export default AnimationManager;
