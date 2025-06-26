/**
 * Simplified Storage Manager - Robust and Educational-Focused
 * Provides essential storage functionality with graceful degradation
 * 
 * @version 1.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from './logger.js';

/**
 * Simple, robust storage manager with fallbacks
 */
class SimpleStorageManager {
    constructor() {
        this.prefix = 'ai_ethics_';
        this.isLocalStorageAvailable = this.checkStorageAvailability('localStorage');
        this.isSessionStorageAvailable = this.checkStorageAvailability('sessionStorage');
        this.memoryStorage = new Map(); // Fallback storage
        
        // Initialize with a simple test
        this.init();
    }
    
    /**
     * Initialize storage and log status
     */
    init() {
        logger.info('Storage Status:');
        logger.info('- localStorage:', this.isLocalStorageAvailable ? '✅ Available' : '❌ Not available');
        logger.info('- sessionStorage:', this.isSessionStorageAvailable ? '✅ Available' : '❌ Not available');
        
        if (!this.isLocalStorageAvailable && !this.isSessionStorageAvailable) {
            logger.warn('⚠️  Browser storage not available. Using memory storage (data will not persist).');
        }
    }
    
    /**
     * Check if a storage type is available
     */
    checkStorageAvailability(storageType) {
        try {
            const storage = window[storageType];
            if (!storage) return false;
            
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Get a value from storage with fallback chain
     */
    get(key, defaultValue = null) {
        const fullKey = this.prefix + key;
        
        try {
            // Try localStorage first
            if (this.isLocalStorageAvailable) {
                const value = localStorage.getItem(fullKey);
                if (value !== null) {
                    return JSON.parse(value);
                }
            }
            
            // Try sessionStorage
            if (this.isSessionStorageAvailable) {
                const value = sessionStorage.getItem(fullKey);
                if (value !== null) {
                    return JSON.parse(value);
                }
            }
            
            // Try memory storage
            if (this.memoryStorage.has(fullKey)) {
                return this.memoryStorage.get(fullKey);
            }
            
        } catch (e) {
            logger.warn(`Error reading storage key "${key}":`, e);
        }
        
        return defaultValue;
    }
    
    /**
     * Set a value in storage with fallback chain
     */
    set(key, value) {
        const fullKey = this.prefix + key;
        let success = false;
        
        try {
            // Try localStorage first
            if (this.isLocalStorageAvailable) {
                localStorage.setItem(fullKey, JSON.stringify(value));
                success = true;
            }
            // Try sessionStorage as backup
            else if (this.isSessionStorageAvailable) {
                sessionStorage.setItem(fullKey, JSON.stringify(value));
                success = true;
            }
            
            // Always store in memory as final fallback
            this.memoryStorage.set(fullKey, value);
            
        } catch (e) {
            logger.warn(`Error saving storage key "${key}":`, e);
            // Fallback to memory storage
            this.memoryStorage.set(fullKey, value);
        }
        
        return success;
    }
    
    /**
     * Remove a value from all storage types
     */
    remove(key) {
        const fullKey = this.prefix + key;
        
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.removeItem(fullKey);
            }
            if (this.isSessionStorageAvailable) {
                sessionStorage.removeItem(fullKey);
            }
            this.memoryStorage.delete(fullKey);
        } catch (e) {
            logger.warn(`Error removing storage key "${key}":`, e);
        }
    }
    
    /**
     * Clear all app data from storage
     */
    clear() {
        try {
            // Clear from localStorage
            if (this.isLocalStorageAvailable) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            }
            
            // Clear from sessionStorage
            if (this.isSessionStorageAvailable) {
                const keys = Object.keys(sessionStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        sessionStorage.removeItem(key);
                    }
                });
            }
            
            // Clear memory storage
            this.memoryStorage.clear();
            
        } catch (e) {
            logger.warn('Error clearing storage:', e);
        }
    }
    
    /**
     * Get all keys for debugging
     */
    getAllKeys() {
        const keys = new Set();
        
        try {
            // From localStorage
            if (this.isLocalStorageAvailable) {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        keys.add(key.replace(this.prefix, ''));
                    }
                });
            }
            
            // From sessionStorage
            if (this.isSessionStorageAvailable) {
                Object.keys(sessionStorage).forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        keys.add(key.replace(this.prefix, ''));
                    }
                });
            }
            
            // From memory storage
            this.memoryStorage.forEach((value, key) => {
                if (key.startsWith(this.prefix)) {
                    keys.add(key.replace(this.prefix, ''));
                }
            });
            
        } catch (e) {
            logger.warn('Error getting storage keys:', e);
        }
        
        return Array.from(keys);
    }
    
    /**
     * Check storage usage (simplified)
     */
    getStorageInfo() {
        return {
            localStorageAvailable: this.isLocalStorageAvailable,
            sessionStorageAvailable: this.isSessionStorageAvailable,
            memoryStorageKeys: this.memoryStorage.size,
            allKeys: this.getAllKeys()
        };
    }
}

/**
 * Convenience methods for common storage operations
 */
class UserPreferences {
    constructor(storage) {
        this.storage = storage;
    }
    
    // User interface preferences
    getTheme() {
        return this.storage.get('theme', 'light');
    }
    
    setTheme(theme) {
        this.storage.set('theme', theme);
    }
    
    getLanguage() {
        return this.storage.get('language', 'en');
    }
    
    setLanguage(language) {
        this.storage.set('language', language);
    }
    
    // Accessibility preferences
    getAccessibilitySettings() {
        return this.storage.get('accessibility', {
            // Note: undefined values mean user hasn't set them explicitly
            // Boolean values mean user has made an explicit choice
        });
    }
    
    setAccessibilitySettings(settings) {
        this.storage.set('accessibility', settings);
    }
    
    // Pre-launch modal preferences
    getPreLaunchSettings() {
        return this.storage.get('preLaunchSettings', {
            skipPreLaunch: false,
            skipPreLaunchFor: {},
            alwaysShowEducatorResources: true
        });
    }
    
    setPreLaunchSettings(settings) {
        this.storage.set('preLaunchSettings', settings);
    }
    
    // Convenience methods for pre-launch modal
    shouldSkipPreLaunch(simulationId = null) {
        const settings = this.getPreLaunchSettings();
        if (simulationId) {
            return settings.skipPreLaunch || settings.skipPreLaunchFor[simulationId];
        }
        return settings.skipPreLaunch;
    }
    
    setSkipPreLaunchFor(simulationId, skip = true) {
        const settings = this.getPreLaunchSettings();
        settings.skipPreLaunchFor[simulationId] = skip;
        this.setPreLaunchSettings(settings);
    }
    
    setSkipPreLaunchGlobally(skip = true) {
        const settings = this.getPreLaunchSettings();
        settings.skipPreLaunch = skip;
        this.setPreLaunchSettings(settings);
    }
    
    // All preferences as one object
    getAllPreferences() {
        return {
            theme: this.getTheme(),
            language: this.getLanguage(),
            accessibility: this.getAccessibilitySettings(),
            preLaunch: this.getPreLaunchSettings()
        };
    }
}

/**
 * User progress tracking
 */
class UserProgress {
    constructor(storage) {
        this.storage = storage;
    }
    
    // Simulation progress
    getSimulationProgress(simulationId) {
        return this.storage.get(`progress_${simulationId}`, {
            completed: false,
            score: 0,
            scenarios: [],
            timeSpent: 0,
            lastPlayed: null
        });
    }
    
    setSimulationProgress(simulationId, progress) {
        this.storage.set(`progress_${simulationId}`, {
            ...progress,
            lastPlayed: new Date().toISOString()
        });
    }
    
    // Overall user stats
    getOverallStats() {
        return this.storage.get('overall_stats', {
            totalSimulations: 0,
            totalTimeSpent: 0,
            averageScore: 0,
            completedSimulations: [],
            achievements: []
        });
    }
    
    setOverallStats(stats) {
        this.storage.set('overall_stats', stats);
    }
    
    // Get all progress data
    getAllProgress() {
        const keys = this.storage.getAllKeys();
        const progressKeys = keys.filter(key => key.startsWith('progress_'));
        const progress = {};
        
        progressKeys.forEach(key => {
            const simulationId = key.replace('progress_', '');
            progress[simulationId] = this.getSimulationProgress(simulationId);
        });
        
        return {
            simulations: progress,
            overall: this.getOverallStats()
        };
    }
}

// Create singleton instances
const simpleStorage = new SimpleStorageManager();
const userPreferences = new UserPreferences(simpleStorage);
const userProgress = new UserProgress(simpleStorage);

// Export for use in other modules
export { 
    SimpleStorageManager, 
    simpleStorage, 
    userPreferences, 
    userProgress 
};

// Make available globally for debugging
window.SimpleStorage = {
    manager: simpleStorage,
    preferences: userPreferences,
    progress: userProgress
};

logger.info('✅ Simple Storage Manager initialized');
