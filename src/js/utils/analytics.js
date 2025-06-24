/**
 * AnalyticsManager - Handles analytics and user behavior tracking
 * Privacy-focused analytics for educational insights
 */

import StorageManager from './storage.js';

class AnalyticsManager {
    static isInitialized = false;
    static config = {
        enabled: true,
        anonymizeData: true,
        batchSize: 10,
        flushInterval: 30000, // 30 seconds
        endpoint: null, // Set if sending to external service
        debug: false
    };

    static eventQueue = [];
    static sessionData = {};
    static flushTimer = null;

    static init(config = {}) {
        if (this.isInitialized) return;

        this.config = { ...this.config, ...config };
        this.sessionData = {
            sessionId: StorageManager.getSessionId(),
            startTime: Date.now(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };

        // Check user consent
        const preferences = StorageManager.getUserPreferences();
        this.config.enabled = preferences.analytics?.allowTracking !== false;

        if (this.config.enabled) {
            this.startSession();
            this.setupEventListeners();
            this.startFlushTimer();
        }

        this.isInitialized = true;
        console.log('AnalyticsManager initialized', { enabled: this.config.enabled });
    }

    static startSession() {
        this.trackEvent('session_start', {
            ...this.sessionData,
            returningUser: this.isReturningUser()
        });
    }

    static setupEventListeners() {
        // Page visibility for session tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('session_pause');
            } else {
                this.trackEvent('session_resume');
            }
        });

        // Window beforeunload for session end
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });

        // Error tracking
        window.addEventListener('error', (e) => {
            this.trackError(e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Performance tracking
        if (typeof PerformanceObserver !== 'undefined') {
            this.setupPerformanceTracking();
        }
    }

    static setupPerformanceTracking() {
        try {
            // Track paint metrics
            const paintObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.trackEvent('performance_paint', {
                        name: entry.name,
                        startTime: entry.startTime,
                        duration: entry.duration
                    });
                });
            });
            paintObserver.observe({ entryTypes: ['paint'] });

            // Track navigation timing
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.trackEvent('performance_navigation', {
                            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                            totalTime: navigation.loadEventEnd - navigation.fetchStart
                        });
                    }
                }, 0);
            });
        } catch (e) {
            console.warn('Performance tracking not available:', e);
        }
    }

    static startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    // Event tracking methods
    static trackEvent(eventName, data = {}, urgent = false) {
        if (!this.config.enabled) return;

        const event = {
            name: eventName,
            timestamp: Date.now(),
            sessionId: this.sessionData.sessionId,
            data: this.config.anonymizeData ? this.anonymizeEventData(data) : data,
            url: window.location.pathname,
            referrer: document.referrer
        };

        if (this.config.debug) {
            console.log('Analytics Event:', event);
        }

        this.eventQueue.push(event);
        StorageManager.logAnalyticsEvent(event);

        if (urgent || this.eventQueue.length >= this.config.batchSize) {
            this.flush();
        }
    }

    static trackEthicsDecision(decision) {
        this.trackEvent('ethics_decision', {
            simulationId: decision.simulationId,
            scenario: decision.scenario,
            category: decision.category,
            change: decision.change,
            hasReasoning: !!decision.reasoning,
            ethicsMetrics: Object.keys(decision.allMetrics || {}).length
        });
    }

    static trackSimulationStart(simulationId, simulationType) {
        this.trackEvent('simulation_start', {
            simulationId,
            simulationType,
            isRetry: StorageManager.isSimulationCompleted(simulationId)
        });
    }

    static trackSimulationComplete(simulationId, report) {
        this.trackEvent('simulation_complete', {
            simulationId,
            duration: report.duration,
            score: report.score,
            decisions: report.decisions,
            scenarios: report.scenarios,
            ethicsMetrics: Object.keys(report.ethicsMetrics).length
        });
    }

    static trackScenarioChange(simulationId, fromScenario, toScenario, totalScenarios) {
        this.trackEvent('scenario_change', {
            simulationId,
            fromScenario,
            toScenario,
            totalScenarios,
            progress: ((toScenario + 1) / totalScenarios) * 100
        });
    }

    static trackUserInteraction(interactionType, elementId, additionalData = {}) {
        this.trackEvent('user_interaction', {
            type: interactionType,
            elementId,
            ...additionalData
        });
    }

    static trackAccessibilityUsage(feature, enabled) {
        this.trackEvent('accessibility_usage', {
            feature,
            enabled,
            timestamp: Date.now()
        });
    }    static trackError(error, context = {}) {
        if (!error) {
            console.warn('Analytics: Attempted to track null/undefined error');
            return;
        }
        
        this.trackEvent('error', {
            message: error.message || 'Unknown error',
            stack: error.stack?.substring(0, 500), // Limit stack trace length
            type: error.constructor?.name || 'Unknown',
            context
        }, true); // Mark as urgent
    }

    static trackPerformanceMetric(metricName, value, unit = 'ms') {
        this.trackEvent('performance_metric', {
            metric: metricName,
            value,
            unit,
            userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
        });
    }

    // Learning analytics specific methods
    static trackLearningPath(simulationId, path) {
        this.trackEvent('learning_path', {
            simulationId,
            pathLength: path.length,
            uniqueScenarios: new Set(path.map(p => p.scenario)).size,
            totalTime: path.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
        });
    }

    static trackKnowledgeGap(topic, confidence, attempts) {
        this.trackEvent('knowledge_gap', {
            topic,
            confidence,
            attempts,
            needsReview: confidence < 70
        });
    }

    static trackEducatorToolUsage(toolName, context) {
        this.trackEvent('educator_tool_usage', {
            tool: toolName,
            context,
            timestamp: Date.now()
        });
    }

    // Data processing methods
    static anonymizeEventData(data) {
        if (!data || typeof data !== 'object') return data;

        const anonymized = { ...data };

        // Remove or hash potentially identifying information
        const sensitiveFields = ['email', 'name', 'userId', 'ipAddress'];
        sensitiveFields.forEach(field => {
            if (anonymized[field]) {
                anonymized[field] = this.hashValue(anonymized[field]);
            }
        });

        // Generalize timestamps to hour precision
        if (anonymized.timestamp) {
            anonymized.timestamp = Math.floor(anonymized.timestamp / 3600000) * 3600000;
        }

        return anonymized;
    }

    static hashValue(value) {
        // Simple hash function for anonymization
        let hash = 0;
        const str = String(value);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    // Data transmission
    static flush() {
        if (this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        if (this.config.endpoint) {
            this.sendToEndpoint(events);
        } else {
            // Store locally if no endpoint configured
            this.storeLocally(events);
        }
    }

    static async sendToEndpoint(events) {
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events,
                    sessionId: this.sessionData.sessionId,
                    timestamp: Date.now()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (this.config.debug) {
                console.log(`Sent ${events.length} events to analytics endpoint`);
            }
        } catch (error) {
            console.error('Failed to send analytics events:', error);
            // Fallback to local storage
            this.storeLocally(events);
        }
    }

    static storeLocally(events) {
        const existingEvents = StorageManager.get('analytics_batch', []);
        const allEvents = [...existingEvents, ...events];
        
        // Keep only the most recent 1000 events
        if (allEvents.length > 1000) {
            allEvents.splice(0, allEvents.length - 1000);
        }
        
        StorageManager.set('analytics_batch', allEvents);
        
        if (this.config.debug) {
            console.log(`Stored ${events.length} events locally`);
        }
    }

    // Analytics insights
    static generateInsights() {
        const events = StorageManager.get('analytics_batch', []);
        const decisions = StorageManager.getDecisions();
        
        const insights = {
            sessionCount: new Set(events.map(e => e.sessionId)).size,
            totalEvents: events.length,
            avgSessionDuration: this.calculateAvgSessionDuration(events),
            popularSimulations: this.getPopularSimulations(events),
            ethicsPatterns: this.analyzeEthicsPatterns(decisions),
            learningProgress: this.calculateLearningProgress(events),
            accessibilityUsage: this.getAccessibilityUsage(events),
            errorRate: this.calculateErrorRate(events)
        };
        
        return insights;
    }

    static calculateAvgSessionDuration(events) {
        const sessions = new Map();
        
        events.forEach(event => {
            if (!sessions.has(event.sessionId)) {
                sessions.set(event.sessionId, { start: event.timestamp, end: event.timestamp });
            } else {
                const session = sessions.get(event.sessionId);
                session.end = Math.max(session.end, event.timestamp);
            }
        });
        
        const durations = Array.from(sessions.values()).map(s => s.end - s.start);
        return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    }

    static getPopularSimulations(events) {
        const simulations = {};
        
        events.forEach(event => {
            if (event.name === 'simulation_start' && event.data.simulationId) {
                simulations[event.data.simulationId] = (simulations[event.data.simulationId] || 0) + 1;
            }
        });
        
        return Object.entries(simulations)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([id, count]) => ({ simulationId: id, startCount: count }));
    }

    static analyzeEthicsPatterns(decisions) {
        if (decisions.length === 0) return {};
        
        const patterns = {
            avgScoreChange: 0,
            mostImprovedMetric: null,
            mostDeclinedMetric: null,
            decisionSpeed: 0
        };
        
        const metricChanges = {};
        decisions.forEach(decision => {
            if (decision.category && decision.change) {
                if (!metricChanges[decision.category]) {
                    metricChanges[decision.category] = [];
                }
                metricChanges[decision.category].push(decision.change);
            }
        });
        
        Object.entries(metricChanges).forEach(([metric, changes]) => {
            const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
            if (!patterns.mostImprovedMetric || avg > metricChanges[patterns.mostImprovedMetric].reduce((a, b) => a + b, 0) / metricChanges[patterns.mostImprovedMetric].length) {
                patterns.mostImprovedMetric = metric;
            }
        });
        
        return patterns;
    }

    static calculateLearningProgress(events) {
        const completions = events.filter(e => e.name === 'simulation_complete');
        return {
            totalCompletions: completions.length,
            avgScore: completions.length > 0 ? 
                completions.reduce((sum, e) => sum + (e.data.score || 0), 0) / completions.length : 0,
            improvementTrend: this.calculateImprovementTrend(completions)
        };
    }

    static calculateImprovementTrend(completions) {
        if (completions.length < 2) return 0;
        
        const scores = completions.map(c => c.data.score || 0);
        const recent = scores.slice(-3);
        const earlier = scores.slice(0, -3);
        
        if (earlier.length === 0) return 0;
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        
        return recentAvg - earlierAvg;
    }

    static getAccessibilityUsage(events) {
        const accessibilityEvents = events.filter(e => e.name === 'accessibility_usage');
        const features = {};
        
        accessibilityEvents.forEach(event => {
            if (event.data.feature) {
                features[event.data.feature] = (features[event.data.feature] || 0) + 1;
            }
        });
        
        return features;
    }

    static calculateErrorRate(events) {
        const totalEvents = events.length;
        const errorEvents = events.filter(e => e.name === 'error').length;
        return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
    }

    // Utility methods
    static isReturningUser() {
        const completions = StorageManager.getCompletedSimulations();
        return completions.length > 0;
    }

    static endSession() {
        this.trackEvent('session_end', {
            duration: Date.now() - this.sessionData.startTime
        }, true);
        this.flush();
    }

    static setEnabled(enabled) {
        this.config.enabled = enabled;
        
        // Update user preferences
        const preferences = StorageManager.getUserPreferences();
        preferences.analytics = { ...preferences.analytics, allowTracking: enabled };
        StorageManager.saveUserPreferences(preferences);
        
        if (enabled && !this.isInitialized) {
            this.init();
        } else if (!enabled) {
            this.clearData();
        }
    }

    static clearData() {
        this.eventQueue = [];
        StorageManager.remove('analytics_batch');
        
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    static exportAnalytics() {
        const insights = this.generateInsights();
        const events = StorageManager.get('analytics_batch', []);
        
        return {
            insights,
            events: events.map(e => ({
                ...e,
                data: this.config.anonymizeData ? this.anonymizeEventData(e.data) : e.data
            })),
            exportedAt: new Date().toISOString(),
            anonymized: this.config.anonymizeData
        };
    }
}

// Initialize when module loads
if (typeof window !== 'undefined') {
    // Auto-initialize with default config
    AnalyticsManager.init();
}

// Export for ES6 modules
export default AnalyticsManager;
