/**
 * Visual Engine Demo - Example simulation showcasing the capabilities of the new Visual Engine
 * Demonstrates interactive objects, animations, accessibility, and performance
 */

import VisualEngine from '../core/visual-engine.js';
import { Button, Slider, Meter, Label } from '../objects/interactive-objects.js';

export class VisualEngineDemo {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            title: 'Visual Engine Demo',
            description: 'Interactive demonstration of the Visual Engine capabilities',
            debug: true,
            ...options
        };
        
        this.engine = null;
        this.objects = new Map();
        this.animationId = 0;
        
        // Demo state
        this.score = 0;
        this.level = 1;
        this.isRunning = false;
        
        this.init();
    }

    async init() {
        console.log('VisualEngineDemo: Initializing...');
        
        this.setupEngine();
        this.createUI();
        this.setupEventListeners();
        this.startDemo();
        
        console.log('VisualEngineDemo: Ready');
    }

    setupEngine() {
        this.engine = new VisualEngine(this.container, {
            renderMode: 'auto',
            accessibility: true,
            debug: this.options.debug,
            width: 800,
            height: 600
        });
    }

    createUI() {
        // Title
        const titleLabel = new Label({
            x: 20,
            y: 20,
            text: this.options.title,
            font: '24px Arial',
            textColor: '#333333'
        });
        this.engine.addObject(titleLabel);
        this.objects.set('title', titleLabel);

        // Description
        const descLabel = new Label({
            x: 20,
            y: 50,
            text: this.options.description,
            font: '14px Arial',
            textColor: '#666666'
        });
        this.engine.addObject(descLabel);
        this.objects.set('description', descLabel);

        // Score meter
        const scoreMeter = new Meter({
            x: 20,
            y: 100,
            width: 200,
            height: 25,
            label: 'Score:',
            min: 0,
            max: 100,
            value: this.score,
            fillColor: '#4caf50'
        });
        this.engine.addObject(scoreMeter);
        this.objects.set('score', scoreMeter);

        // Level meter
        const levelMeter = new Meter({
            x: 250,
            y: 100,
            width: 150,
            height: 25,
            label: 'Level:',
            min: 1,
            max: 10,
            value: this.level,
            fillColor: '#2196f3'
        });
        this.engine.addObject(levelMeter);
        this.objects.set('level', levelMeter);

        // Control sliders
        const speedSlider = new Slider({
            x: 20,
            y: 150,
            width: 200,
            height: 20,
            min: 1,
            max: 10,
            value: 5,
            onChange: (value) => this.onSpeedChange(value)
        });
        this.engine.addObject(speedSlider);
        this.objects.set('speed', speedSlider);

        const speedLabel = new Label({
            x: 230,
            y: 155,
            text: 'Speed: 5',
            font: '12px Arial'
        });
        this.engine.addObject(speedLabel);
        this.objects.set('speedLabel', speedLabel);

        const difficultySlider = new Slider({
            x: 20,
            y: 190,
            width: 200,
            height: 20,
            min: 1,
            max: 5,
            value: 3,
            onChange: (value) => this.onDifficultyChange(value)
        });
        this.engine.addObject(difficultySlider);
        this.objects.set('difficulty', difficultySlider);

        const difficultyLabel = new Label({
            x: 230,
            y: 195,
            text: 'Difficulty: 3',
            font: '12px Arial'
        });
        this.engine.addObject(difficultyLabel);
        this.objects.set('difficultyLabel', difficultyLabel);

        // Action buttons
        const startButton = new Button({
            x: 20,
            y: 240,
            width: 100,
            height: 35,
            text: 'Start',
            onClick: () => this.startDemo()
        });
        this.engine.addObject(startButton);
        this.objects.set('startButton', startButton);

        const pauseButton = new Button({
            x: 130,
            y: 240,
            width: 100,
            height: 35,
            text: 'Pause',
            onClick: () => this.pauseDemo()
        });
        this.engine.addObject(pauseButton);
        this.objects.set('pauseButton', pauseButton);

        const resetButton = new Button({
            x: 240,
            y: 240,
            width: 100,
            height: 35,
            text: 'Reset',
            onClick: () => this.resetDemo()
        });
        this.engine.addObject(resetButton);
        this.objects.set('resetButton', resetButton);

        // Animation demo button
        const animateButton = new Button({
            x: 350,
            y: 240,
            width: 120,
            height: 35,
            text: 'Animate!',
            onClick: () => this.demonstrateAnimations()
        });
        this.engine.addObject(animateButton);
        this.objects.set('animateButton', animateButton);

        // Demo objects area
        this.createDemoObjects();
    }

    createDemoObjects() {
        // Create some animated circles for visual interest
        const colors = ['#ff5722', '#9c27b0', '#3f51b5', '#009688', '#ff9800'];
        
        for (let i = 0; i < 5; i++) {
            const circle = {
                type: 'circle',
                id: `circle_${i}`,
                x: 50 + i * 60,
                y: 350,
                radius: 20,
                fill: colors[i],
                stroke: '#333333',
                strokeWidth: 2,
                visible: true,
                
                // Animation properties
                originalY: 350,
                animationOffset: i * 0.5,
                animationSpeed: 1,
                
                update: function(deltaTime) {
                    // Simple bounce animation
                    const time = (performance.now() + this.animationOffset * 1000) / 1000;
                    this.y = this.originalY + Math.sin(time * this.animationSpeed) * 20;
                },
                
                render: function(renderer) {
                    renderer.renderObject(this);
                }
            };
            
            this.engine.addObject(circle);
            this.objects.set(`circle_${i}`, circle);
        }

        // Interactive target
        const target = new Button({
            x: 400,
            y: 320,
            width: 80,
            height: 80,
            text: 'Click me!',
            fill: '#4caf50',
            hoverColor: '#66bb6a',
            pressedColor: '#388e3c',
            onClick: () => this.onTargetClick()
        });
        this.engine.addObject(target);
        this.objects.set('target', target);

        // Status display
        const statusLabel = new Label({
            x: 20,
            y: 300,
            text: 'Status: Ready',
            font: '14px Arial',
            textColor: '#333333'
        });
        this.engine.addObject(statusLabel);
        this.objects.set('status', statusLabel);
    }

    setupEventListeners() {
        // Engine performance monitoring
        if (this.options.debug) {
            setInterval(() => {
                const stats = this.engine.getStats();
                console.log('Engine Stats:', stats);
            }, 5000);
        }
    }

    // Event handlers
    onSpeedChange(value) {
        this.objects.get('speedLabel').setText(`Speed: ${value}`);
        
        // Update animation speed
        for (let i = 0; i < 5; i++) {
            const circle = this.objects.get(`circle_${i}`);
            if (circle) {
                circle.animationSpeed = value / 5;
            }
        }
        
        this.updateStatus(`Speed changed to ${value}`);
    }

    onDifficultyChange(value) {
        this.objects.get('difficultyLabel').setText(`Difficulty: ${value}`);
        this.updateStatus(`Difficulty set to ${value}`);
    }

    onTargetClick() {
        this.score += 10 * this.level;
        this.objects.get('score').setValue(Math.min(100, this.score));
        
        if (this.score >= this.level * 25) {
            this.level = Math.min(10, this.level + 1);
            this.objects.get('level').setValue(this.level);
            this.updateStatus(`Level up! Now at level ${this.level}`);
        } else {
            this.updateStatus(`Score: ${this.score}`);
        }
        
        // Animate the target
        this.engine.animationManager.scale(this.objects.get('target'), 1.2, 200);
    }

    startDemo() {
        this.isRunning = true;
        this.engine.start();
        this.updateStatus('Demo started');
        
        // Animate start sequence
        this.animateStartSequence();
    }

    pauseDemo() {
        if (this.isRunning) {
            this.engine.pause();
            this.updateStatus('Demo paused');
        } else {
            this.engine.resume();
            this.updateStatus('Demo resumed');
        }
        this.isRunning = !this.isRunning;
    }

    resetDemo() {
        this.score = 0;
        this.level = 1;
        
        this.objects.get('score').setValue(this.score);
        this.objects.get('level').setValue(this.level);
        this.objects.get('speed').setValue(5);
        this.objects.get('difficulty').setValue(3);
        
        this.updateStatus('Demo reset');
    }

    demonstrateAnimations() {
        // Fade out all circles
        for (let i = 0; i < 5; i++) {
            const circle = this.objects.get(`circle_${i}`);
            if (circle) {
                this.engine.animationManager.fadeOut(circle, 500, {
                    onComplete: () => {
                        // Fade back in with different color
                        circle.fill = `hsl(${Math.random() * 360}, 70%, 60%)`;
                        this.engine.animationManager.fadeIn(circle, 500);
                    }
                });
            }
        }
        
        // Shake the target
        this.engine.animationManager.shake(this.objects.get('target'), 10, 1000);
        
        this.updateStatus('Animation demonstration running...');
    }

    animateStartSequence() {
        // Slide in UI elements
        const elements = ['title', 'description', 'score', 'level'];
        
        elements.forEach((id, index) => {
            const element = this.objects.get(id);
            if (element) {
                const originalX = element.x;
                element.x = -element.width;
                
                this.engine.animationManager.to(element, { x: originalX }, 500, {
                    delay: index * 100,
                    easing: 'easeOutCubic'
                });
            }
        });
    }

    updateStatus(message) {
        const statusLabel = this.objects.get('status');
        if (statusLabel) {
            statusLabel.setText(`Status: ${message}`);
        }
    }

    // Accessibility helpers
    getAccessibilityDescription() {
        return `Visual Engine Demo. Score: ${this.score}, Level: ${this.level}. Use Tab to navigate controls.`;
    }

    // Cleanup
    destroy() {
        if (this.engine) {
            this.engine.destroy();
        }
        
        this.objects.clear();
        console.log('VisualEngineDemo: Destroyed');
    }
}

export default VisualEngineDemo;
