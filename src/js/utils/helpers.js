/**
 * Helper utilities for the AI Ethics Simulations platform
 * Common functions used across different modules
 */

class Helpers {
    // Math utilities
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    static map(value, inputMin, inputMax, outputMin, outputMax) {
        return outputMin + (outputMax - outputMin) * ((value - inputMin) / (inputMax - inputMin));
    }

    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static roundTo(number, decimals) {
        return Number(Math.round(number + 'e' + decimals) + 'e-' + decimals);
    }

    // Array utilities
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static getRandomElements(array, count) {
        const shuffled = this.shuffleArray(array);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    static groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    }

    // String utilities
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static camelToKebab(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    }

    static kebabToCamel(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    static truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    static stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Time utilities
    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
        } else {
            return `${seconds}s`;
        }
    }

    static formatTimestamp(timestamp, format = 'short') {
        const date = new Date(timestamp);
        
        switch (format) {
            case 'short':
                return date.toLocaleDateString();
            case 'long':
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            case 'time':
                return date.toLocaleTimeString();
            case 'iso':
                return date.toISOString();
            default:
                return date.toString();
        }
    }

    static getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static interpolateColor(color1, color2, factor) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return color1;
        
        const r = Math.round(this.lerp(rgb1.r, rgb2.r, factor));
        const g = Math.round(this.lerp(rgb1.g, rgb2.g, factor));
        const b = Math.round(this.lerp(rgb1.b, rgb2.b, factor));
        
        return this.rgbToHex(r, g, b);
    }

    static getEthicsColor(value) {
        // Red -> Yellow -> Green gradient for ethics scores
        if (value < 50) {
            return this.interpolateColor('#ff4444', '#ffaa00', value / 50);
        } else {
            return this.interpolateColor('#ffaa00', '#00aa00', (value - 50) / 50);
        }
    }

    // DOM utilities
    static createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }

    static getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    static isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    static scrollToElement(element, behavior = 'smooth') {
        element.scrollIntoView({ behavior, block: 'center' });
    }

    // Event utilities
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static once(func) {
        let called = false;
        return function executedFunction(...args) {
            if (!called) {
                called = true;
                return func.apply(this, args);
            }
        };
    }

    // Validation utilities
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static isEmpty(value) {
        return value == null || value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }

    // Browser detection utilities
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /chrome/i.test(ua) && !/edge/i.test(ua),
            firefox: /firefox/i.test(ua),
            safari: /safari/i.test(ua) && !/chrome/i.test(ua),
            edge: /edge/i.test(ua),
            ie: /msie|trident/i.test(ua)
        };
        
        const browser = Object.keys(browsers).find(key => browsers[key]) || 'unknown';
        return { browser, userAgent: ua };
    }

    static supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
            return false;
        }
    }

    static supportsLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    static getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    // Ethics-specific utilities
    static calculateEthicsScore(metrics) {
        if (!metrics || metrics.size === 0) return 0;
        
        let totalScore = 0;
        let totalWeight = 0;
        
        metrics.forEach(metric => {
            totalScore += metric.value * (metric.weight || 1);
            totalWeight += metric.weight || 1;
        });
        
        return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    }

    static getEthicsGrade(score) {
        if (score >= 90) return { grade: 'A+', description: 'Excellent' };
        if (score >= 80) return { grade: 'A', description: 'Very Good' };
        if (score >= 70) return { grade: 'B', description: 'Good' };
        if (score >= 60) return { grade: 'C', description: 'Fair' };
        if (score >= 50) return { grade: 'D', description: 'Needs Improvement' };
        return { grade: 'F', description: 'Poor' };
    }

    static generateEthicsInsight(oldValue, newValue, category) {
        const change = newValue - oldValue;
        const absChange = Math.abs(change);
        
        let intensity = 'slightly';
        if (absChange > 20) intensity = 'significantly';
        else if (absChange > 10) intensity = 'moderately';
        
        const direction = change > 0 ? 'improved' : 'declined';
        
        return `${category} has ${intensity} ${direction} by ${absChange} points.`;
    }

    // Simulation utilities
    static generateScenarioId() {
        return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static createProgressBar(current, total, width = 200) {
        const percentage = Math.max(0, Math.min(100, (current / total) * 100));
        return {
            percentage,
            width: (percentage / 100) * width,
            text: `${current}/${total}`,
            completed: current >= total
        };
    }

    static generateSimulationReport(simulation) {
        const ethicsScore = this.calculateEthicsScore(simulation.ethicsMetrics);
        const grade = this.getEthicsGrade(ethicsScore);
        
        return {
            simulationId: simulation.id,
            title: simulation.title,
            completedAt: new Date().toISOString(),
            duration: simulation.state.timeElapsed,
            score: ethicsScore,
            grade: grade.grade,
            decisions: simulation.state.decisions.length,
            scenarios: simulation.scenarios.length,
            ethicsMetrics: Object.fromEntries(simulation.ethicsMetrics),
            insights: this.generateInsights(simulation),
            recommendations: this.generateRecommendations(simulation)
        };
    }

    static generateInsights(simulation) {
        const insights = [];
        const decisions = simulation.state.decisions;
        
        if (decisions.length > 0) {
            const avgDecisionTime = simulation.state.timeElapsed / decisions.length;
            insights.push(`Average decision time: ${this.formatDuration(avgDecisionTime)}`);
        }
        
        // Analyze ethics patterns
        simulation.ethicsMetrics.forEach((metric, name) => {
            if (metric.value >= 80) {
                insights.push(`Strong performance in ${metric.label}`);
            } else if (metric.value <= 40) {
                insights.push(`Opportunity to improve ${metric.label}`);
            }
        });
        
        return insights;
    }

    static generateRecommendations(simulation) {
        const recommendations = [];
        const ethicsScore = this.calculateEthicsScore(simulation.ethicsMetrics);
        
        if (ethicsScore < 70) {
            recommendations.push('Consider reviewing the ethical principles before retrying');
            recommendations.push('Take more time to consider the consequences of each decision');
        }
        
        simulation.ethicsMetrics.forEach((metric, name) => {
            if (metric.value < 50) {
                recommendations.push(`Focus on improving ${metric.label} in future simulations`);
            }
        });
        
        return recommendations;
    }

    // File utilities
    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    static readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Animation utilities
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static easeIn(t) {
        return t * t;
    }

    static easeOut(t) {
        return t * (2 - t);
    }

    static animate(duration, updateCallback, completeCallback, easing = this.easeInOut) {
        const startTime = Date.now();
        
        const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing(progress);
            
            updateCallback(easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else if (completeCallback) {
                completeCallback();
            }
        };
        
        requestAnimationFrame(tick);
    }
}

// Export for ES6 modules
export default Helpers;
