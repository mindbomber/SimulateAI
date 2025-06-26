import logger from './logger.js';

/**
 * Enhanced StorageManager - Modern data persistence system for SimulateAI
 * Provides secure, performant, and accessible data storage with advanced features
 * 
 * Features:
 * - GDPR compliance and data privacy
 * - Data encryption for sensitive information
 * - Performance optimization with compression and caching
 * - Theme and accessibility preferences integration
 * - Advanced error handling and recovery
 * - Data validation and sanitization
 * - Backup and restoration capabilities
 * - Analytics and usage tracking
 * - Cross-tab synchronization
 * - Storage quota management
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

// Enhanced constants and configuration
const STORAGE_CONSTANTS = {
    PREFIX: 'simAI_',
    VERSION: '2.0.0',
    MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
    COMPRESSION_THRESHOLD: 1024, // 1KB
    BACKUP_RETENTION_DAYS: 90,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    SYNC_INTERVAL: 5000, // 5 seconds
    VALIDATION_PATTERNS: {
        SIMULATION_ID: /^[a-z0-9-]+$/,
        USER_ID: /^[a-zA-Z0-9\-_]+$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

const STORAGE_EVENTS = {
    DATA_UPDATED: 'storage:dataUpdated',
    QUOTA_EXCEEDED: 'storage:quotaExceeded',
    ERROR_OCCURRED: 'storage:errorOccurred',
    BACKUP_CREATED: 'storage:backupCreated',
    DATA_MIGRATED: 'storage:dataMigrated'
};

/**
 * Enhanced encryption utility for sensitive data
 */
class StorageEncryption {
    static key = null;
    
    static async generateKey() {
        if (!window.crypto?.subtle) {
            logger.warn('Web Crypto API not available, using base64 encoding');
            return null;
        }
        
        try {
            this.key = await window.crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
            return this.key;
        } catch (error) {
            logger.warn('Failed to generate encryption key:', error);
            return null;
        }
    }
    
    static async encrypt(data) {
        if (!this.key || !window.crypto?.subtle) {
            return btoa(JSON.stringify(data)); // Fallback to base64
        }
        
        try {
            const jsonData = JSON.stringify(data);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(jsonData);
            
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                this.key,
                dataBuffer
            );
            
            const result = {
                data: Array.from(new Uint8Array(encrypted)),
                iv: Array.from(iv)
            };
            
            return btoa(JSON.stringify(result));
        } catch (error) {
            logger.warn('Encryption failed, using fallback:', error);
            return btoa(JSON.stringify(data));
        }
    }
    
    static async decrypt(encryptedData) {
        if (!this.key || !window.crypto?.subtle) {
            try {
                return JSON.parse(atob(encryptedData)); // Fallback from base64
            } catch {
                return null;
            }
        }
        
        try {
            const parsed = JSON.parse(atob(encryptedData));
            
            if (!parsed.data || !parsed.iv) {
                // Fallback data format
                return JSON.parse(atob(encryptedData));
            }
            
            const dataArray = new Uint8Array(parsed.data);
            const iv = new Uint8Array(parsed.iv);
            
            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                this.key,
                dataArray
            );
            
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decrypted);
            return JSON.parse(jsonString);
        } catch (error) {
            logger.warn('Decryption failed, trying fallback:', error);
            try {
                return JSON.parse(atob(encryptedData));
            } catch {
                return null;
            }
        }
    }
}

/**
 * Data validation and sanitization utilities
 */
class StorageValidator {
    static validateSimulationId(id) {
        return typeof id === 'string' && STORAGE_CONSTANTS.VALIDATION_PATTERNS.SIMULATION_ID.test(id);
    }
    
    static validateUserId(id) {
        return typeof id === 'string' && STORAGE_CONSTANTS.VALIDATION_PATTERNS.USER_ID.test(id);
    }
    
    static validateEmail(email) {
        return typeof email === 'string' && STORAGE_CONSTANTS.VALIDATION_PATTERNS.EMAIL.test(email);
    }
    
    static sanitizeString(str, maxLength = 1000) {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>]/g, '').substring(0, maxLength);
    }
    
    static validatePreferences(prefs) {
        if (!prefs || typeof prefs !== 'object') return false;
        
        const validStructure = {
            accessibility: 'object',
            simulation: 'object',
            analytics: 'object',
            theme: 'object'
        };
        
        for (const [key, type] of Object.entries(validStructure)) {
            if (prefs[key] && typeof prefs[key] !== type) {
                return false;
            }
        }
        
        return true;
    }
}

/**
 * Enhanced StorageManager - Modern data persistence with advanced features
 */
class StorageManager {
    static STORAGE_PREFIX = STORAGE_CONSTANTS.PREFIX;
    static VERSION = STORAGE_CONSTANTS.VERSION;    static storage = null;
    static sessionStorage = null;
    static memoryFallback = new Map();
    static eventListeners = new Map();
    static compressionEnabled = true;
    static encryptionEnabled = true;
    static syncEnabled = true;
    static lastSyncTime = 0;
    static quotaWarningThreshold = 0.8; // 80% of quota

    /**
     * Initialize the enhanced storage system
     */
    static async init() {
        try {
            // Initialize encryption
            if (this.encryptionEnabled) {
                await StorageEncryption.generateKey();
            }
            
            // Check storage availability first
            if (!this.isStorageAvailable() || !window.localStorage || !window.sessionStorage) {
                logger.warn('Local storage not available, using in-memory storage');
                this.storage = new Map();
                this.sessionStorage = new Map();
                this.setupMemoryStorage();
            } else {
                // Setup storage references only if available
                this.storage = window.localStorage;
                this.sessionStorage = window.sessionStorage;
            }
            
            // Setup cross-tab synchronization only if real storage is available
            if (this.syncEnabled && this.storage !== this.memoryFallback) {
                this.setupCrossTabSync();
            }
            
            // Setup quota monitoring
            this.setupQuotaMonitoring();
            
            // Perform data migration
            await this.migrateData();
            
            // Cleanup old data
            this.cleanupOldData();
            
            logger.debug('Enhanced StorageManager initialized successfully');
            this.emit(STORAGE_EVENTS.DATA_UPDATED, { action: 'initialized' });
            
        } catch (error) {
            logger.error('Failed to initialize StorageManager:', error);
            this.handleError(error, 'initialization');
        }
    }

    /**
     * Setup memory storage for fallback
     */
    static setupMemoryStorage() {
        this.memoryFallback = new Map();
        
        // Simulate localStorage API
        if (this.storage instanceof Map) {
            this.storage.setItem = (key, value) => this.storage.set(key, value);
            this.storage.getItem = (key) => this.storage.get(key) || null;
            this.storage.removeItem = (key) => this.storage.delete(key);
            this.storage.clear = () => this.storage.clear();
        }
        
        if (this.sessionStorage instanceof Map) {
            this.sessionStorage.setItem = (key, value) => this.sessionStorage.set(key, value);
            this.sessionStorage.getItem = (key) => this.sessionStorage.get(key) || null;
            this.sessionStorage.removeItem = (key) => this.sessionStorage.delete(key);
            this.sessionStorage.clear = () => this.sessionStorage.clear();
        }
    }

    /**
     * Setup cross-tab synchronization
     */
    static setupCrossTabSync() {
        if (typeof window === 'undefined' || !window.addEventListener) return;
        
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith(this.STORAGE_PREFIX)) {
                const key = event.key.substring(this.STORAGE_PREFIX.length);
                this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                    key,
                    oldValue: event.oldValue,
                    newValue: event.newValue,
                    source: 'external'
                });
            }
        });
        
        // Periodic sync check
        setInterval(() => {
            this.syncCheck();
        }, STORAGE_CONSTANTS.SYNC_INTERVAL);
    }
    
    /**
     * Setup storage quota monitoring
     */
    static setupQuotaMonitoring() {
        // Check quota on storage operations
        setInterval(() => {
            this.checkStorageQuota();
        }, 60000); // Check every minute
    }
    
    /**
     * Check storage quota and warn if approaching limit
     */
    static async checkStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const usageRatio = estimate.usage / estimate.quota;
                
                if (usageRatio > this.quotaWarningThreshold) {
                    logger.warn(`Storage quota ${(usageRatio * 100).toFixed(1)}% full`);
                    this.emit(STORAGE_EVENTS.QUOTA_EXCEEDED, {
                        usage: estimate.usage,
                        quota: estimate.quota,
                        ratio: usageRatio
                    });
                }
            }
        } catch (error) {
            logger.warn('Failed to check storage quota:', error);
        }
    }
    
    /**
     * Sync check for cross-tab updates
     */
    static syncCheck() {
        const currentTime = Date.now();
        if (currentTime - this.lastSyncTime > STORAGE_CONSTANTS.SYNC_INTERVAL) {
            this.lastSyncTime = currentTime;
            // Perform any necessary sync operations
        }
    }    /**
     * Enhanced storage availability check
     */
    static isStorageAvailable() {
        try {
            // First check if localStorage exists and is not null
            if (!window.localStorage || !window.sessionStorage) {
                return false;
            }
            
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            
            // Additional checks
            const testObj = { test: 'data' };
            localStorage.setItem(test, JSON.stringify(testObj));
            const retrieved = JSON.parse(localStorage.getItem(test));
            localStorage.removeItem(test);
            
            return retrieved && retrieved.test === 'data';
        } catch (e) {
            return false;
        }
    }

    /**
     * Enhanced data migration with versioning
     */
    static async migrateData() {
        try {
            const currentVersion = this.get('version');
            
            if (!currentVersion) {
                // First time initialization
                logger.debug('Initializing storage for first time');
                await this.performFirstTimeSetup();
            } else if (currentVersion !== this.VERSION) {
                logger.debug(`Migrating data from ${currentVersion} to ${this.VERSION}`);
                await this.performMigration(currentVersion, this.VERSION);
            }
            
            this.set('version', this.VERSION);
            this.emit(STORAGE_EVENTS.DATA_MIGRATED, { 
                from: currentVersion, 
                to: this.VERSION 
            });
            
        } catch (error) {
            logger.error('Data migration failed:', error);
            this.handleError(error, 'migration');
        }
    }
    
    /**
     * First time setup
     */
    static async performFirstTimeSetup() {
        // Initialize default preferences
        const defaultPreferences = this.getDefaultPreferences();
        this.saveUserPreferences(defaultPreferences);
        
        // Create initial backup
        await this.createBackup('initial_setup');
        
        logger.debug('First time setup completed');
    }
    
    /**
     * Perform version-specific migration
     */
    static async performMigration(fromVersion, toVersion) {
        try {
            // Version-specific migration logic
            if (fromVersion === '1.0' && toVersion === '2.0.0') {
                await this.migrateFrom1To2();
            }
            
            // Create migration backup
            await this.createBackup(`migration_${fromVersion}_to_${toVersion}`);
            
        } catch (error) {
            logger.error('Migration failed:', error);
            throw error;
        }
    }
    
    /**
     * Migrate from version 1.0 to 2.0
     */
    static async migrateFrom1To2() {
        // Migrate old preference structure
        const oldPrefs = this.get('user_preferences');
        if (oldPrefs) {
            const newPrefs = this.convertOldPreferences(oldPrefs);
            this.saveUserPreferences(newPrefs);
        }
        
        // Migrate decision format if needed
        const decisions = this.get('decisions', []);
        const migratedDecisions = decisions.map(decision => ({
            ...decision,
            version: '2.0.0',
            migrated: true
        }));
        
        this.set('decisions', migratedDecisions);
        logger.debug('Migration from 1.0 to 2.0 completed');
    }
    
    /**
     * Convert old preference structure to new format
     */
    static convertOldPreferences(oldPrefs) {
        return {
            ...oldPrefs,
            theme: {
                mode: 'auto', // auto, light, dark, high-contrast
                reducedMotion: false,
                fontSize: 'medium',
                colorScheme: 'default'
            },
            accessibility: {
                ...oldPrefs.accessibility,
                screenReader: false,
                voiceOver: false,
                keyboardOnly: false
            },
            privacy: {
                analyticsEnabled: oldPrefs.analytics?.allowTracking || false,
                personalDataCollection: false,
                thirdPartySharing: false
            },
            performance: {
                enableAnimations: true,
                enableHaptics: true,
                preloadContent: true,
                compressionEnabled: true
            }
        };
    }    /**
     * Enhanced storage set method with compression and encryption
     */
    static async set(key, value, options = {}) {
        try {
            const fullKey = this.STORAGE_PREFIX + key;
            let processedValue = value;
            
            // Validate key
            if (!key || typeof key !== 'string') {
                throw new Error('Invalid storage key');
            }
            
            // Create metadata
            const metadata = {
                timestamp: Date.now(),
                version: this.VERSION,
                type: typeof value,
                compressed: false,
                encrypted: options.encrypt || false,
                ttl: options.ttl || null
            };
            
            // Serialize value
            const serialized = JSON.stringify(value);
            
            // Compress if enabled and data is large enough
            if (this.compressionEnabled && serialized.length > STORAGE_CONSTANTS.COMPRESSION_THRESHOLD) {
                try {
                    processedValue = await this.compress(value);
                    metadata.compressed = true;
                } catch (compressError) {
                    logger.warn('Compression failed, using uncompressed data:', compressError);
                    processedValue = value;
                }
            }
            
            // Encrypt sensitive data
            if (this.encryptionEnabled && (options.encrypt || this.isSensitiveKey(key))) {
                try {
                    processedValue = await StorageEncryption.encrypt(processedValue);
                    metadata.encrypted = true;
                } catch (encryptError) {
                    logger.warn('Encryption failed, using unencrypted data:', encryptError);
                }
            }
            
            // Create final data structure
            const finalData = {
                value: processedValue,
                metadata
            };
            
            const dataString = JSON.stringify(finalData);
            
            // Check size limits
            if (dataString.length > STORAGE_CONSTANTS.MAX_STORAGE_SIZE / 100) {
                logger.warn(`Large data detected for key '${key}': ${dataString.length} bytes`);
            }
            
            // Store data
            if (this.storage instanceof Map) {
                this.storage.set(fullKey, dataString);
            } else {
                this.storage.setItem(fullKey, dataString);
            }
            
            // Emit update event
            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                key,
                action: 'set',
                size: dataString.length,
                metadata
            });
            
        } catch (error) {
            logger.error('Error saving to storage:', error);
            this.handleError(error, 'set', { key, value });
            throw error;
        }
    }

    /**
     * Enhanced storage get method with decompression and decryption
     */
    static async get(key, defaultValue = null) {
        try {
            const fullKey = this.STORAGE_PREFIX + key;
            
            // Validate key
            if (!key || typeof key !== 'string') {
                return defaultValue;
            }
            
            // Check if storage is available
            if (!this.storage) {
                return defaultValue;
            }
            
            // Get raw data
            let item;
            if (this.storage instanceof Map) {
                item = this.storage.get(fullKey);
            } else {
                item = this.storage.getItem(fullKey);
            }
            
            if (!item) {
                return defaultValue;
            }
            
            // Parse data
            let parsedData;
            try {
                parsedData = JSON.parse(item);
            } catch (parseError) {
                logger.warn(`Invalid JSON data for key '${key}', returning default value`);
                return defaultValue;
            }
            
            // Handle legacy data format
            if (!parsedData.metadata) {
                return parsedData.value || parsedData;
            }
            
            // Check TTL
            if (parsedData.metadata.ttl) {
                const expireTime = parsedData.metadata.timestamp + parsedData.metadata.ttl;
                if (Date.now() > expireTime) {
                    this.remove(key); // Auto-cleanup expired data
                    return defaultValue;
                }
            }
            
            let finalValue = parsedData.value;
            
            // Decrypt if needed
            if (parsedData.metadata.encrypted) {
                try {
                    finalValue = await StorageEncryption.decrypt(finalValue);
                } catch (decryptError) {
                    logger.error(`Failed to decrypt data for key '${key}':`, decryptError);
                    return defaultValue;
                }
            }
            
            // Decompress if needed
            if (parsedData.metadata.compressed) {
                try {
                    finalValue = await this.decompress(finalValue);
                } catch (decompressError) {
                    logger.error(`Failed to decompress data for key '${key}':`, decompressError);
                    return defaultValue;
                }
            }
            
            return finalValue;
            
        } catch (error) {
            logger.error('Error reading from storage:', error);
            this.handleError(error, 'get', { key });
            return defaultValue;
        }
    }

    /**
     * Enhanced remove method with cleanup
     */
    static remove(key) {
        try {
            const fullKey = this.STORAGE_PREFIX + key;
            
            if (this.storage instanceof Map) {
                const existed = this.storage.has(fullKey);
                this.storage.delete(fullKey);
                
                if (existed) {
                    this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                        key,
                        action: 'remove'
                    });
                }
            } else {
                const existed = this.storage.getItem(fullKey) !== null;
                this.storage.removeItem(fullKey);
                
                if (existed) {
                    this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                        key,
                        action: 'remove'
                    });
                }
            }
            
        } catch (error) {
            logger.error('Error removing from storage:', error);
            this.handleError(error, 'remove', { key });
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
            logger.error('Error clearing storage:', e);
        }
    }

    // Session storage methods
    static setSession(key, value) {
        const fullKey = this.STORAGE_PREFIX + key;
        
        try {
            // Check if sessionStorage is available
            if (!this.sessionStorage) {
                return;
            }
            
            if (this.sessionStorage instanceof Map) {
                this.sessionStorage.set(fullKey, JSON.stringify(value));
            } else {
                this.sessionStorage.setItem(fullKey, JSON.stringify(value));
            }
        } catch (e) {
            logger.error('Error saving to session storage:', e);
        }
    }

    static getSession(key, defaultValue = null) {
        const fullKey = this.STORAGE_PREFIX + key;
        
        try {
            // Check if sessionStorage is available
            if (!this.sessionStorage) {
                return defaultValue;
            }
            
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
            logger.error('Error reading from session storage:', e);
        }
        
        return defaultValue;
    }    /**
     * Enhanced user preferences with validation and theme integration
     */
    static async saveUserPreferences(preferences) {
        try {
            // Validate preferences structure
            if (!StorageValidator.validatePreferences(preferences)) {
                throw new Error('Invalid preferences structure');
            }
            
            // Merge with existing preferences to avoid overwriting
            const currentPrefs = await this.getUserPreferences();
            const mergedPrefs = this.deepMerge(currentPrefs, preferences);
            
            // Add metadata
            mergedPrefs._metadata = {
                lastUpdated: Date.now(),
                version: this.VERSION,
                source: 'user'
            };
            
            await this.set('user_preferences', mergedPrefs, { encrypt: true });
            
            // Emit preferences change event
            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                key: 'user_preferences',
                action: 'update',
                data: mergedPrefs
            });
            
        } catch (error) {
            logger.error('Failed to save user preferences:', error);
            this.handleError(error, 'saveUserPreferences', { preferences });
            throw error;
        }
    }

    static async getUserPreferences() {
        try {
            const preferences = await this.get('user_preferences');
            
            if (preferences) {
                // Validate and migrate if necessary
                if (!StorageValidator.validatePreferences(preferences)) {
                    logger.warn('Invalid preferences found, using defaults');
                    return this.getDefaultPreferences();
                }
                
                // Merge with defaults to ensure all properties exist
                return this.deepMerge(this.getDefaultPreferences(), preferences);
            }
            
            return this.getDefaultPreferences();
            
        } catch (error) {
            logger.error('Failed to get user preferences:', error);
            this.handleError(error, 'getUserPreferences');
            return this.getDefaultPreferences();
        }
    }
    
    /**
     * Get default preferences with theme integration
     */
    static getDefaultPreferences() {
        return {
            accessibility: {
                highContrast: false,
                largeText: false,
                keyboardNavigation: true,
                announcements: true,
                screenReader: false,
                voiceOver: false,
                keyboardOnly: false,
                reducedMotion: false,
                colorBlindSupport: false
            },
            theme: {
                mode: 'auto', // auto, light, dark, high-contrast
                reducedMotion: false,
                fontSize: 'medium',
                colorScheme: 'default',
                customColors: null
            },
            simulation: {
                showHints: true,
                autoAdvance: false,
                soundEnabled: true,
                hapticFeedback: true,
                pauseOnFocusLoss: true,
                skipAnimations: false,
                difficulty: 'adaptive'
            },
            privacy: {
                analyticsEnabled: false,
                personalDataCollection: false,
                thirdPartySharing: false,
                cookiesEnabled: true,
                dataRetention: 30 // days
            },
            performance: {
                enableAnimations: true,
                enableHaptics: true,
                preloadContent: true,
                compressionEnabled: true,
                qualityMode: 'balanced' // performance, balanced, quality
            },
            analytics: {
                allowTracking: false,
                detailedTracking: false,
                errorReporting: true,
                usageStatistics: false
            }
        };
    }
    
    /**
     * Deep merge objects
     */
    static deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }
    
    /**
     * Update specific preference
     */
    static async updatePreference(category, key, value) {
        try {
            const preferences = await this.getUserPreferences();
            
            if (!preferences[category]) {
                preferences[category] = {};
            }
            
            preferences[category][key] = value;
            await this.saveUserPreferences(preferences);
            
            return true;
        } catch (error) {
            logger.error('Failed to update preference:', error);
            return false;
        }
    }
    
    /**
     * Get specific preference with fallback
     */
    static async getPreference(category, key, defaultValue = null) {
        try {
            const preferences = await this.getUserPreferences();
            return preferences[category]?.[key] ?? defaultValue;
        } catch (error) {
            logger.error('Failed to get preference:', error);
            return defaultValue;
        }
    }

    // User progress methods - modernized with async, validation, and encryption
    static async saveUserProgress(simulationId, progress) {
        try {
            // Validate simulation ID
            if (!StorageValidator.validateSimulationId(simulationId)) {
                throw new Error('Invalid simulation ID format');
            }

            // Validate progress data
            if (!progress || typeof progress !== 'object') {
                throw new Error('Invalid progress data');
            }

            const allProgress = await this.get('user_progress', {});
            allProgress[simulationId] = {
                ...progress,
                lastUpdated: Date.now(),
                version: this.VERSION
            };

            await this.set('user_progress', allProgress, {
                encrypt: this.isSensitiveKey('user_progress'),
                compress: true
            });

            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                action: 'progress_saved',
                simulationId,
                timestamp: Date.now()
            });

            logger.debug(`User progress saved for simulation: ${simulationId}`);
        } catch (error) {
            this.handleError(error, 'saveUserProgress', { simulationId });
            throw error;
        }
    }

    static async getUserProgress(simulationId = null) {
        try {
            if (simulationId && !StorageValidator.validateSimulationId(simulationId)) {
                throw new Error('Invalid simulation ID format');
            }

            const allProgress = await this.get('user_progress', {});
            return simulationId ? allProgress[simulationId] : allProgress;
        } catch (error) {
            this.handleError(error, 'getUserProgress', { simulationId });
            return simulationId ? null : {};
        }
    }

    static async resetUserProgress(simulationId = null) {
        try {
            if (simulationId) {
                if (!StorageValidator.validateSimulationId(simulationId)) {
                    throw new Error('Invalid simulation ID format');
                }

                const allProgress = await this.get('user_progress', {});
                delete allProgress[simulationId];
                await this.set('user_progress', allProgress);

                this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                    action: 'progress_reset',
                    simulationId,
                    timestamp: Date.now()
                });
            } else {
                this.remove('user_progress');
                this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                    action: 'all_progress_reset',
                    timestamp: Date.now()
                });
            }

            logger.debug(`User progress reset${simulationId ? ` for ${simulationId}` : ' (all)'}`);
        } catch (error) {
            this.handleError(error, 'resetUserProgress', { simulationId });
            throw error;
        }
    }

    // Enhanced decision logging with validation and analytics
    static async logDecision(decision) {
        try {
            // Validate decision data
            if (!decision || typeof decision !== 'object') {
                throw new Error('Invalid decision data');
            }

            if (decision.simulationId && !StorageValidator.validateSimulationId(decision.simulationId)) {
                throw new Error('Invalid simulation ID in decision');
            }

            const decisions = await this.get('decisions', []);
            const enrichedDecision = {
                ...decision,
                id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                sessionId: this.getSessionId(),
                version: this.VERSION,
                sanitizedContext: StorageValidator.sanitizeString(decision.context || '', 500)
            };

            decisions.push(enrichedDecision);

            // Keep only last 1000 decisions for performance
            if (decisions.length > 1000) {
                decisions.splice(0, decisions.length - 1000);
            }

            await this.set('decisions', decisions, {
                encrypt: this.isSensitiveKey('decisions'),
                compress: true
            });

            // Track analytics
            await this.trackAnalyticsEvent('decision_logged', {
                simulationId: decision.simulationId,
                category: decision.category,
                ethicsImpact: decision.ethicsImpact
            });

            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                action: 'decision_logged',
                decisionId: enrichedDecision.id,
                timestamp: Date.now()
            });

        } catch (error) {
            this.handleError(error, 'logDecision', { decision });
            throw error;
        }
    }

    static async getDecisions(simulationId = null, limit = null) {
        try {
            if (simulationId && !StorageValidator.validateSimulationId(simulationId)) {
                throw new Error('Invalid simulation ID format');
            }

            const decisions = await this.get('decisions', []);
            
            let filtered = decisions;
            if (simulationId) {
                filtered = decisions.filter(d => d.simulationId === simulationId);
            }
            
            if (limit && typeof limit === 'number' && limit > 0) {
                filtered = filtered.slice(-limit);
            }
            
            return filtered;
        } catch (error) {
            this.handleError(error, 'getDecisions', { simulationId, limit });
            return [];
        }
    }

    static async getDecisionStats(simulationId = null) {
        try {
            const decisions = await this.getDecisions(simulationId);
            
            const stats = {
                total: decisions.length,
                byCategory: {},
                bySimulation: {},
                avgTimePerDecision: 0,
                ethicsImpact: {
                    positive: 0,
                    negative: 0,
                    neutral: 0
                },
                timeRange: {
                    earliest: null,
                    latest: null
                }
            };

            let totalTime = 0;
            const timestamps = [];

            decisions.forEach(decision => {
                // Category stats
                const category = decision.category || 'unknown';
                stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

                // Simulation stats
                if (decision.simulationId) {
                    stats.bySimulation[decision.simulationId] = (stats.bySimulation[decision.simulationId] || 0) + 1;
                }

                // Ethics impact
                const impact = decision.ethicsImpact || 'neutral';
                if (stats.ethicsImpact[impact] !== undefined) {
                    stats.ethicsImpact[impact]++;
                }

                // Timing
                if (decision.timestamp) {
                    timestamps.push(decision.timestamp);
                    if (decision.timeSpent && typeof decision.timeSpent === 'number') {
                        totalTime += decision.timeSpent;
                    }
                }
            });

            // Calculate averages and ranges
            if (decisions.length > 0 && totalTime > 0) {
                stats.avgTimePerDecision = Math.round(totalTime / decisions.length);
            }

            if (timestamps.length > 0) {
                timestamps.sort((a, b) => a - b);
                stats.timeRange.earliest = new Date(timestamps[0]).toISOString();
                stats.timeRange.latest = new Date(timestamps[timestamps.length - 1]).toISOString();
            }

            return stats;
        } catch (error) {
            this.handleError(error, 'getDecisionStats', { simulationId });
            return {
                total: 0,
                byCategory: {},
                bySimulation: {},
                avgTimePerDecision: 0,
                ethicsImpact: { positive: 0, negative: 0, neutral: 0 },
                timeRange: { earliest: null, latest: null }
            };
        }
    }

    // Enhanced simulation completion tracking
    static async markSimulationComplete(simulationId, report) {
        try {
            if (!StorageValidator.validateSimulationId(simulationId)) {
                throw new Error('Invalid simulation ID format');
            }

            if (!report || typeof report !== 'object') {
                throw new Error('Invalid completion report');
            }

            const completion = {
                id: simulationId,
                completedAt: Date.now(),
                score: report.score || 0,
                feedback: StorageValidator.sanitizeString(report.feedback || '', 1000),
                ethicsRating: report.ethicsRating || 'unknown',
                timeSpent: report.timeSpent || 0,
                decisionCount: report.decisionCount || 0,
                version: this.VERSION
            };

            const completions = await this.get('completed_simulations', []);
            
            // Remove any previous completion for this simulation
            const existingIndex = completions.findIndex(c => c.id === simulationId);
            if (existingIndex > -1) {
                completions.splice(existingIndex, 1);
            }

            completions.push(completion);
            await this.set('completed_simulations', completions, {
                encrypt: this.isSensitiveKey('completed_simulations'),
                compress: true
            });

            // Update progress
            await this.saveUserProgress(simulationId, {
                completed: true,
                score: completion.score,
                completedAt: completion.completedAt,
                ethicsRating: completion.ethicsRating
            });

            // Track analytics
            await this.trackAnalyticsEvent('simulation_completed', {
                simulationId,
                score: completion.score,
                timeSpent: completion.timeSpent,
                decisionCount: completion.decisionCount
            });

            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                action: 'simulation_completed',
                simulationId,
                timestamp: Date.now()
            });

            logger.debug(`Simulation ${simulationId} marked as complete`);
        } catch (error) {
            this.handleError(error, 'markSimulationComplete', { simulationId });
            throw error;
        }
    }

    static async getCompletedSimulations() {
        try {
            return await this.get('completed_simulations', []);
        } catch (error) {
            this.handleError(error, 'getCompletedSimulations');
            return [];
        }
    }

    static async isSimulationCompleted(simulationId) {
        try {
            if (!StorageValidator.validateSimulationId(simulationId)) {
                return false;
            }

            const progress = await this.getUserProgress(simulationId);
            return progress && progress.completed === true;
        } catch (error) {
            this.handleError(error, 'isSimulationCompleted', { simulationId });
            return false;
        }
    }

    // Enhanced analytics with async support and validation
    static async trackAnalyticsEvent(eventType, data = {}) {
        try {
            if (!eventType || typeof eventType !== 'string') {
                throw new Error('Invalid event type');
            }

            const event = {
                type: eventType,
                data,
                timestamp: Date.now(),
                sessionId: this.getSessionId(),
                userAgent: navigator.userAgent,
                url: window.location?.href || 'unknown',
                version: this.VERSION
            };

            const events = this.getSession('analytics_events', []);
            events.push(event);

            // Keep only last 100 events in session for performance
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }

            this.setSession('analytics_events', events);

            // Also store persistent analytics summary
            await this.updateAnalyticsSummary(eventType, data);

            logger.debug(`Analytics event tracked: ${eventType}`);
        } catch (error) {
            this.handleError(error, 'trackAnalyticsEvent', { eventType, data });
        }
    }

    static async updateAnalyticsSummary(eventType, _data) {
        try {
            const summary = await this.get('analytics_summary', {
                totalEvents: 0,
                eventTypes: {},
                lastUpdated: Date.now()
            });

            summary.totalEvents++;
            summary.eventTypes[eventType] = (summary.eventTypes[eventType] || 0) + 1;
            summary.lastUpdated = Date.now();

            await this.set('analytics_summary', summary, {
                encrypt: this.isSensitiveKey('analytics_summary'),
                compress: true
            });
        } catch (error) {
            logger.warn('Failed to update analytics summary:', error);
        }
    }

    static getAnalyticsEvents() {
        return this.getSession('analytics_events', []);
    }

    static async getAnalyticsSummary() {
        try {
            return await this.get('analytics_summary', {
                totalEvents: 0,
                eventTypes: {},
                lastUpdated: null
            });
        } catch (error) {
            this.handleError(error, 'getAnalyticsSummary');
            return { totalEvents: 0, eventTypes: {}, lastUpdated: null };
        }
    }

    // Backup and restore functionality
    static async createBackup(label = 'manual_backup') {
        try {
            const backupData = {
                version: this.VERSION,
                label: StorageValidator.sanitizeString(label, 50),
                createdAt: Date.now(),
                data: {
                    preferences: await this.getUserPreferences(),
                    progress: await this.getUserProgress(),
                    decisions: await this.getDecisions(),
                    completions: await this.getCompletedSimulations(),
                    analyticsSummary: await this.getAnalyticsSummary()
                }
            };

            const backups = await this.get('system_backups', []);
            
            // Add backup ID
            backupData.id = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            backups.push(backupData);

            // Keep only last 10 backups to manage storage
            if (backups.length > 10) {
                backups.splice(0, backups.length - 10);
            }

            await this.set('system_backups', backups, {
                encrypt: true,
                compress: true
            });

            this.emit(STORAGE_EVENTS.BACKUP_CREATED, {
                backupId: backupData.id,
                label,
                timestamp: Date.now()
            });

            logger.debug(`Backup created: ${label} (${backupData.id})`);
            return backupData.id;
        } catch (error) {
            this.handleError(error, 'createBackup', { label });
            throw error;
        }
    }

    static async getBackups() {
        try {
            const backups = await this.get('system_backups', []);
            // Return metadata only, not full data
            return backups.map(backup => ({
                id: backup.id,
                label: backup.label,
                createdAt: backup.createdAt,
                version: backup.version,
                dataSize: JSON.stringify(backup.data).length
            }));
        } catch (error) {
            this.handleError(error, 'getBackups');
            return [];
        }
    }

    static async restoreFromBackup(backupId) {
        try {
            if (!backupId || typeof backupId !== 'string') {
                throw new Error('Invalid backup ID');
            }

            const backups = await this.get('system_backups', []);
            const backup = backups.find(b => b.id === backupId);

            if (!backup) {
                throw new Error('Backup not found');
            }

            // Create a backup of current state before restoring
            await this.createBackup(`pre_restore_${Date.now()}`);

            // Restore data
            const { data } = backup;

            if (data.preferences) {
                await this.saveUserPreferences(data.preferences);
            }

            if (data.progress) {
                await this.set('user_progress', data.progress);
            }

            if (data.decisions) {
                await this.set('decisions', data.decisions);
            }

            if (data.completions) {
                await this.set('completed_simulations', data.completions);
            }

            if (data.analyticsSummary) {
                await this.set('analytics_summary', data.analyticsSummary);
            }

            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                action: 'backup_restored',
                backupId,
                timestamp: Date.now()
            });

            logger.debug(`Data restored from backup: ${backupId}`);
            return true;
        } catch (error) {
            this.handleError(error, 'restoreFromBackup', { backupId });
            throw error;
        }
    }

    static async deleteBackup(backupId) {
        try {
            if (!backupId || typeof backupId !== 'string') {
                throw new Error('Invalid backup ID');
            }

            const backups = await this.get('system_backups', []);
            const index = backups.findIndex(b => b.id === backupId);

            if (index === -1) {
                throw new Error('Backup not found');
            }

            backups.splice(index, 1);
            await this.set('system_backups', backups);

            logger.debug(`Backup deleted: ${backupId}`);
            return true;
        } catch (error) {
            this.handleError(error, 'deleteBackup', { backupId });
            throw error;
        }
    }

    static async clearBackups() {
        try {
            this.remove('system_backups');
            logger.debug('All backups cleared');
            return true;
        } catch (error) {
            this.handleError(error, 'clearBackups');
            throw error;
        }
    }

    // Enhanced export/import with validation and error handling
    static async exportData(includeAnalytics = false) {
        try {
            const data = {
                version: this.VERSION,
                exportedAt: new Date().toISOString(),
                preferences: await this.getUserPreferences(),
                progress: await this.getUserProgress(),
                decisions: await this.getDecisions(),
                completions: await this.getCompletedSimulations()
            };

            if (includeAnalytics) {
                data.analyticsSummary = await this.getAnalyticsSummary();
            }

            // Track export event
            await this.trackAnalyticsEvent('data_exported', {
                includeAnalytics,
                dataSize: JSON.stringify(data).length
            });

            return JSON.stringify(data, null, 2);
        } catch (error) {
            this.handleError(error, 'exportData');
            throw error;
        }
    }

    static async importData(jsonData, options = {}) {
        try {
            if (!jsonData || typeof jsonData !== 'string') {
                throw new Error('Invalid JSON data');
            }

            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.version) {
                throw new Error('Invalid data format - missing version');
            }

            // Create backup before import
            if (options.createBackup !== false) {
                await this.createBackup(`pre_import_${Date.now()}`);
            }

            // Import data with validation
            let importedItems = 0;

            if (data.preferences && StorageValidator.validatePreferences(data.preferences)) {
                await this.saveUserPreferences(data.preferences);
                importedItems++;
            }

            if (data.progress && typeof data.progress === 'object') {
                await this.set('user_progress', data.progress);
                importedItems++;
            }

            if (data.decisions && Array.isArray(data.decisions)) {
                await this.set('decisions', data.decisions);
                importedItems++;
            }

            if (data.completions && Array.isArray(data.completions)) {
                await this.set('completed_simulations', data.completions);
                importedItems++;
            }

            if (data.analyticsSummary && typeof data.analyticsSummary === 'object') {
                await this.set('analytics_summary', data.analyticsSummary);
                importedItems++;
            }

            // Track import event
            await this.trackAnalyticsEvent('data_imported', {
                importedItems,
                dataVersion: data.version,
                importOptions: options
            });

            this.emit(STORAGE_EVENTS.DATA_UPDATED, {
                action: 'data_imported',
                importedItems,
                timestamp: Date.now()
            });

            logger.debug(`Data imported successfully. Items imported: ${importedItems}`);
            return { success: true, importedItems };
        } catch (error) {
            this.handleError(error, 'importData', { options });
            return { success: false, error: error.message };
        }
    }

    // Enhanced data management and cleanup
    static async getStorageSize() {
        let totalSize = 0;
        
        try {
            if (this.storage === localStorage) {
                // Real localStorage
                for (const key in localStorage) {
                    if (key.startsWith(this.STORAGE_PREFIX)) {
                        totalSize += localStorage[key].length + key.length;
                    }
                }
            } else if (this.storage instanceof Map) {
                // Memory fallback
                for (const [key, value] of this.storage) {
                    if (key.startsWith(this.STORAGE_PREFIX)) {
                        totalSize += JSON.stringify(value).length + key.length;
                    }
                }
            }
        } catch (error) {
            logger.error('Error calculating storage size:', error);
        }
        
        return totalSize;
    }

    static async cleanupOldData(olderThanDays = 30) {
        try {
            const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
            let cleanedItems = 0;

            // Clean old decisions
            const decisions = await this.get('decisions', []);
            const recentDecisions = decisions.filter(d => d.timestamp > cutoffTime);
            if (recentDecisions.length !== decisions.length) {
                await this.set('decisions', recentDecisions);
                cleanedItems += decisions.length - recentDecisions.length;
            }

            // Clean old session data
            if (this.sessionStorage) {
                try {
                    const analyticsEvents = this.getSession('analytics_events', []);
                    const recentEvents = analyticsEvents.filter(e => e.timestamp > cutoffTime);
                    if (recentEvents.length !== analyticsEvents.length) {
                        this.setSession('analytics_events', recentEvents);
                        cleanedItems += analyticsEvents.length - recentEvents.length;
                    }
                } catch (error) {
                    logger.warn('Failed to clean session analytics:', error);
                }
            }

            // Clean old backups (keep only recent ones)
            const backupCutoff = Date.now() - (STORAGE_CONSTANTS.BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);
            const backups = await this.get('system_backups', []);
            const recentBackups = backups.filter(b => b.createdAt > backupCutoff);
            if (recentBackups.length !== backups.length) {
                await this.set('system_backups', recentBackups);
                cleanedItems += backups.length - recentBackups.length;
            }

            // Track cleanup
            await this.trackAnalyticsEvent('data_cleanup', {
                olderThanDays,
                cleanedItems,
                cutoffTime
            });

            logger.debug(`Cleaned ${cleanedItems} old data items (older than ${olderThanDays} days)`);
            return cleanedItems;
        } catch (error) {
            this.handleError(error, 'cleanupOldData', { olderThanDays });
            return 0;
        }
    }

    /**
     * Check if a key contains sensitive data that should be encrypted
     */
    static isSensitiveKey(key) {
        const sensitiveKeys = [
            'user_credentials', 'personal_data', 'analytics_data',
            'email', 'user_id', 'session_token'
        ];
        return sensitiveKeys.some(sensitive => key.includes(sensitive));
    }
    
    /**
     * Compress data using built-in compression
     */
    static async compress(data) {
        if (!window.CompressionStream) {
            // Fallback: simple string compression
            return this.simpleCompress(JSON.stringify(data));
        }
        
        try {
            const jsonString = JSON.stringify(data);
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(new TextEncoder().encode(jsonString));
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) chunks.push(value);
            }
            
            const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                compressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            return Array.from(compressed);
        } catch (error) {
            logger.warn('Native compression failed, using fallback:', error);
            return this.simpleCompress(JSON.stringify(data));
        }
    }
    
    /**
     * Decompress data
     */
    static async decompress(compressedData) {
        if (!window.DecompressionStream) {
            return JSON.parse(this.simpleDecompress(compressedData));
        }
        
        try {
            const compressed = new Uint8Array(compressedData);
            const stream = new DecompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(compressed);
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) chunks.push(value);
            }
            
            const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                decompressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            const jsonString = new TextDecoder().decode(decompressed);
            return JSON.parse(jsonString);
        } catch (error) {
            logger.warn('Native decompression failed, using fallback:', error);
            return JSON.parse(this.simpleDecompress(compressedData));
        }
    }
    
    /**
     * Simple compression fallback using Run-Length Encoding
     */
    static simpleCompress(str) {
        if (typeof str !== 'string') return str;
        
        let compressed = '';
        for (let i = 0; i < str.length; i++) {
            let count = 1;
            while (i + 1 < str.length && str[i] === str[i + 1]) {
                count++;
                i++;
            }
            compressed += count > 1 ? count + str[i] : str[i];
        }
        return compressed;
    }
    
    /**
     * Simple decompression fallback
     */
    static simpleDecompress(compressed) {
        if (typeof compressed !== 'string') return compressed;
        
        let decompressed = '';
        for (let i = 0; i < compressed.length; i++) {
            if (/\d/.test(compressed[i])) {
                const count = parseInt(compressed[i]);
                if (count > 1 && i + 1 < compressed.length) {
                    decompressed += compressed[i + 1].repeat(count);
                    i++; // Skip the character we just repeated
                } else {
                    decompressed += compressed[i];
                }
            } else {
                decompressed += compressed[i];
            }
        }
        return decompressed;
    }
    
    /**
     * Enhanced error handling
     */
    static handleError(error, operation, context = {}) {
        const errorInfo = {
            operation,
            error: error.message || String(error),
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            storageAvailable: this.isStorageAvailable()
        };
        
        // Log error
        logger.error(`StorageManager ${operation} error:`, errorInfo);
        
        // Emit error event
        this.emit(STORAGE_EVENTS.ERROR_OCCURRED, errorInfo);
        
        // Store error for debugging (with size limit)
        try {
            const errors = this.getSession('storage_errors', []);
            errors.push(errorInfo);
            
            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            this.setSession('storage_errors', errors);
        } catch (logError) {
            logger.warn('Failed to log storage error:', logError);
        }
    }
    
    /**
     * Event emitter functionality
     */
    static on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    static off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    static emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    logger.error('Event listener error:', error);
                }
            });
        }
    }
}

// Initialize when module loads
if (typeof window !== 'undefined') {
    StorageManager.init();
}

// Export for ES6 modules
export default StorageManager;
