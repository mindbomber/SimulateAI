/**
 * StorageManager - Handles local storage and data persistence
 * Manages user progress, decisions, and simulation data
 */

class StorageManager {
    static STORAGE_PREFIX = 'ai_ethics_sim_';
    static VERSION = '1.0';

    static init() {
        this.storage = window.localStorage;
        this.sessionStorage = window.sessionStorage;
        
        // Check storage availability
        if (!this.isStorageAvailable()) {
            console.warn('Local storage not available, using in-memory storage');
            this.storage = new Map();
            this.sessionStorage = new Map();
        }
        
        this.migrateData();
    }

    static isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static migrateData() {
        const currentVersion = this.get('version');
        if (currentVersion !== this.VERSION) {
            // Perform data migration if needed
            console.log(`Migrating data from ${currentVersion} to ${this.VERSION}`);
            this.set('version', this.VERSION);
        }
    }

    // Generic storage methods
    static set(key, value) {
        const fullKey = this.STORAGE_PREFIX + key;
        const data = {
            value,
            timestamp: Date.now(),
            version: this.VERSION
        };
        
        try {
            if (this.storage instanceof Map) {
                this.storage.set(fullKey, JSON.stringify(data));
            } else {
                this.storage.setItem(fullKey, JSON.stringify(data));
            }
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    static get(key, defaultValue = null) {
        const fullKey = this.STORAGE_PREFIX + key;
        
        try {
            let item;
            if (this.storage instanceof Map) {
                item = this.storage.get(fullKey);
            } else {
                item = this.storage.getItem(fullKey);
            }
            
            if (item) {
                const data = JSON.parse(item);
                return data.value;
            }
        } catch (e) {
            console.error('Error reading from storage:', e);
        }
        
        return defaultValue;
    }

    static remove(key) {
        const fullKey = this.STORAGE_PREFIX + key;
        
        try {
            if (this.storage instanceof Map) {
                this.storage.delete(fullKey);
            } else {
                this.storage.removeItem(fullKey);
            }
        } catch (e) {
            console.error('Error removing from storage:', e);
        }
    }

    static clear() {
        try {
            if (this.storage instanceof Map) {
                this.storage.clear();
            } else {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.STORAGE_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                });
            }
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
    }

    // Session storage methods
    static setSession(key, value) {
        const fullKey = this.STORAGE_PREFIX + key;
        
        try {
            if (this.sessionStorage instanceof Map) {
                this.sessionStorage.set(fullKey, JSON.stringify(value));
            } else {
                this.sessionStorage.setItem(fullKey, JSON.stringify(value));
            }
        } catch (e) {
            console.error('Error saving to session storage:', e);
        }
    }

    static getSession(key, defaultValue = null) {
        const fullKey = this.STORAGE_PREFIX + key;
        
        try {
            let item;
            if (this.sessionStorage instanceof Map) {
                item = this.sessionStorage.get(fullKey);
            } else {
                item = this.sessionStorage.getItem(fullKey);
            }
            
            if (item) {
                return JSON.parse(item);
            }
        } catch (e) {
            console.error('Error reading from session storage:', e);
        }
        
        return defaultValue;
    }

    // User preferences
    static saveUserPreferences(preferences) {
        this.set('user_preferences', preferences);
    }

    static getUserPreferences() {
        return this.get('user_preferences', {
            accessibility: {
                highContrast: false,
                largeText: false,
                keyboardNavigation: true,
                announcements: true
            },
            simulation: {
                showHints: true,
                autoAdvance: false,
                soundEnabled: true
            },
            analytics: {
                allowTracking: true
            }
        });
    }

    // User progress
    static saveUserProgress(simulationId, progress) {
        const allProgress = this.get('user_progress', {});
        allProgress[simulationId] = {
            ...progress,
            lastUpdated: Date.now()
        };
        this.set('user_progress', allProgress);
    }

    static getUserProgress(simulationId = null) {
        const allProgress = this.get('user_progress', {});
        return simulationId ? allProgress[simulationId] : allProgress;
    }

    static resetUserProgress(simulationId = null) {
        if (simulationId) {
            const allProgress = this.get('user_progress', {});
            delete allProgress[simulationId];
            this.set('user_progress', allProgress);
        } else {
            this.remove('user_progress');
        }
    }

    // Decision logging
    static logDecision(decision) {
        const decisions = this.get('decisions', []);
        decisions.push({
            ...decision,
            id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        });
        
        // Keep only last 1000 decisions
        if (decisions.length > 1000) {
            decisions.splice(0, decisions.length - 1000);
        }
        
        this.set('decisions', decisions);
    }

    static getDecisions(simulationId = null, limit = null) {
        const decisions = this.get('decisions', []);
        
        let filtered = decisions;
        if (simulationId) {
            filtered = decisions.filter(d => d.simulationId === simulationId);
        }
        
        if (limit) {
            filtered = filtered.slice(-limit);
        }
        
        return filtered;
    }

    static getDecisionStats(simulationId = null) {
        const decisions = this.getDecisions(simulationId);
        
        const stats = {
            total: decisions.length,
            byCategory: {},
            bySimulation: {},
            avgTimePerDecision: 0,
            ethicsImpact: {
                positive: 0,
                negative: 0,
                neutral: 0
            }
        };
        
        if (decisions.length === 0) return stats;
        
        let totalTime = 0;
        let decisionCount = 0;
        
        decisions.forEach(decision => {
            // Category stats
            if (decision.category) {
                stats.byCategory[decision.category] = (stats.byCategory[decision.category] || 0) + 1;
            }
            
            // Simulation stats
            if (decision.simulationId) {
                stats.bySimulation[decision.simulationId] = (stats.bySimulation[decision.simulationId] || 0) + 1;
            }
            
            // Ethics impact
            if (decision.change) {
                if (decision.change > 0) {
                    stats.ethicsImpact.positive++;
                } else if (decision.change < 0) {
                    stats.ethicsImpact.negative++;
                } else {
                    stats.ethicsImpact.neutral++;
                }
            }
            
            // Time calculation (simplified)
            if (decision.timestamp && decisionCount > 0) {
                totalTime += 30000; // Assume 30 seconds per decision on average
                decisionCount++;
            }
        });
        
        stats.avgTimePerDecision = decisionCount > 0 ? totalTime / decisionCount : 0;
        
        return stats;
    }

    // Simulation completion tracking
    static markSimulationComplete(simulationId, report) {
        const completions = this.get('completed_simulations', []);
        
        const completion = {
            simulationId,
            completedAt: Date.now(),
            report,
            id: `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        completions.push(completion);
        this.set('completed_simulations', completions);
        
        // Update progress
        this.saveUserProgress(simulationId, {
            completed: true,
            score: report.score,
            completedAt: Date.now()
        });
    }

    static getCompletedSimulations() {
        return this.get('completed_simulations', []);
    }

    static isSimulationCompleted(simulationId) {
        const progress = this.getUserProgress(simulationId);
        return progress && progress.completed;
    }

    // Analytics data
    static logAnalyticsEvent(event) {
        const events = this.getSession('analytics_events', []);
        events.push({
            ...event,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        });
        
        // Keep only last 100 events in session
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        this.setSession('analytics_events', events);
    }

    static getAnalyticsEvents() {
        return this.getSession('analytics_events', []);
    }

    static getSessionId() {
        let sessionId = this.getSession('session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.setSession('session_id', sessionId);
        }
        return sessionId;
    }

    // Export/Import functionality
    static exportData() {
        const data = {
            version: this.VERSION,
            exportedAt: new Date().toISOString(),
            preferences: this.getUserPreferences(),
            progress: this.getUserProgress(),
            decisions: this.getDecisions(),
            completions: this.getCompletedSimulations()
        };
        
        return JSON.stringify(data, null, 2);
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.preferences) {
                this.saveUserPreferences(data.preferences);
            }
            
            if (data.progress) {
                this.set('user_progress', data.progress);
            }
            
            if (data.decisions) {
                this.set('decisions', data.decisions);
            }
            
            if (data.completions) {
                this.set('completed_simulations', data.completions);
            }
            
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }

    // Data management
    static getStorageSize() {
        let totalSize = 0;
        
        try {
            for (let key in localStorage) {
                if (key.startsWith(this.STORAGE_PREFIX)) {
                    totalSize += localStorage[key].length;
                }
            }
        } catch (e) {
            console.error('Error calculating storage size:', e);
        }
        
        return totalSize;
    }

    static cleanOldData(olderThanDays = 30) {
        const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        
        // Clean old decisions
        const decisions = this.get('decisions', []);
        const recentDecisions = decisions.filter(d => d.timestamp > cutoffTime);
        this.set('decisions', recentDecisions);
        
        // Clean old analytics events (handled in session storage, so not persistent)
        
        console.log(`Cleaned data older than ${olderThanDays} days`);
    }
}

// Initialize when module loads
if (typeof window !== 'undefined') {
    StorageManager.init();
}

// Export for ES6 modules
export default StorageManager;
