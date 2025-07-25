import logger from "./logger.js";

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

// OPTIMIZED: Enhanced constants and configuration with reduced redundancy
const BYTE_CONSTANTS = {
  KB_SIZE: 1024,
  MB_SIZE: 1024,
};

const TIME_CONSTANTS = {
  MINUTES_PER_HOUR: 60,
  SECONDS_PER_MINUTE: 60,
  MS_PER_SECOND: 1000,
  HOURS_PER_DAY: 24,
};

const FORMAT_CONSTANTS = {
  BASE_TEN: 10,
  DECIMAL_RADIX: 36,
  IV_SIZE: 12,
  ID_SUFFIX_LENGTH: 9,
  SUBSTRING_START: 2,
};

const LIMIT_CONSTANTS = {
  DEFAULT_STRING_LIMIT: 500,
  LABEL_STRING_LIMIT: 50,
  DECISION_LIMIT: 1000,
  ERROR_LOG_LIMIT: 50,
};

const QUOTA_WARNING_THRESHOLD = 0.8;
const QUOTA_CHECK_INTERVAL = 60000; // 1 minute
const SESSION_TIMEOUT_MINUTES = 30;

const STORAGE_CONSTANTS = {
  PREFIX: "simAI_",
  VERSION: "2.0.0",
  MAX_STORAGE_SIZE:
    FORMAT_CONSTANTS.BASE_TEN * BYTE_CONSTANTS.KB_SIZE * BYTE_CONSTANTS.MB_SIZE, // 10MB
  COMPRESSION_THRESHOLD: BYTE_CONSTANTS.KB_SIZE, // 1KB
  BACKUP_RETENTION_DAYS: 90,
  SESSION_TIMEOUT:
    SESSION_TIMEOUT_MINUTES *
    TIME_CONSTANTS.MINUTES_PER_HOUR *
    TIME_CONSTANTS.MS_PER_SECOND, // 30 minutes
  SYNC_INTERVAL: 5000, // 5 seconds
  VALIDATION_PATTERNS: {
    SIMULATION_ID: /^[a-z0-9-]+$/,
    USER_ID: /^[a-zA-Z0-9\-_]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

const STORAGE_EVENTS = {
  DATA_UPDATED: "storage:dataUpdated",
  QUOTA_EXCEEDED: "storage:quotaExceeded",
  ERROR_OCCURRED: "storage:errorOccurred",
  BACKUP_CREATED: "storage:backupCreated",
  DATA_MIGRATED: "storage:dataMigrated",
};

/**
 * CSS class name constants for better maintainability and coordination with stylesheets
 * Maps storage preferences to actual CSS classes used throughout the application
 */
const CSS_CLASSES = {
  // Theme-related classes
  DARK_MODE: "dark-mode",
  LIGHT_MODE: "light-mode",
  HIGH_CONTRAST: "high-contrast",
  AUTO_THEME: "auto-theme",

  // Accessibility classes
  KEYBOARD_USER: "keyboard-user",
  SCREEN_READER: "sr-only",
  SCREEN_READER_FOCUSABLE: "sr-only-focusable",
  LARGE_TEXT: "large-text",
  REDUCED_MOTION: "reduced-motion",
  COLOR_BLIND_SUPPORT: "color-blind-support",

  // Font size classes
  FONT_SMALL: "font-small",
  FONT_MEDIUM: "font-medium",
  FONT_LARGE: "font-large",
  FONT_EXTRA_LARGE: "font-xl",

  // Animation and performance classes
  NO_ANIMATIONS: "no-animations",
  REDUCED_ANIMATIONS: "reduced-animations",
  HIGH_PERFORMANCE: "high-performance",
  QUALITY_MODE: "quality-mode",

  // Skip link and navigation
  SKIP_LINK: "skip-link",
  FOCUS_VISIBLE: "focus-visible",
};

/**
 * CSS custom property names for theme system coordination
 */
const CSS_PROPERTIES = {
  // Theme variables
  THEME_BG_PRIMARY: "--theme-bg-primary",
  THEME_BG_SECONDARY: "--theme-bg-secondary",
  THEME_TEXT_PRIMARY: "--theme-text-primary",
  THEME_TEXT_SECONDARY: "--theme-text-secondary",
  THEME_BORDER: "--theme-border",
  THEME_ACCENT: "--theme-accent",

  // Font scaling
  FONT_SCALE: "--font-scale",
  FONT_SIZE_BASE: "--font-size-base",

  // Color system
  COLOR_PRIMARY: "--color-primary",
  COLOR_SECONDARY: "--color-secondary",
  COLOR_BACKGROUND: "--background-color",
  COLOR_TEXT: "--text-color",

  // Spacing and layout
  CONTAINER_PADDING: "--container-padding",
  BORDER_RADIUS: "--border-radius",
};

/**
 * Enhanced encryption utility for sensitive data
 */
class StorageEncryption {
  static key = null;

  static async generateKey() {
    if (!window.crypto?.subtle) {
      logger.warn("Web Crypto API not available, using base64 encoding");
      return null;
    }

    try {
      this.key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
      return this.key;
    } catch (error) {
      logger.warn("Failed to generate encryption key:", error);
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

      const iv = window.crypto.getRandomValues(
        new Uint8Array(FORMAT_CONSTANTS.IV_SIZE),
      );
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        this.key,
        dataBuffer,
      );

      const result = {
        data: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv),
      };

      return btoa(JSON.stringify(result));
    } catch (error) {
      logger.warn("Encryption failed, using fallback:", error);
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
        { name: "AES-GCM", iv },
        this.key,
        dataArray,
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn("Decryption failed, trying fallback:", error);
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
    return (
      typeof id === "string" &&
      STORAGE_CONSTANTS.VALIDATION_PATTERNS.SIMULATION_ID.test(id)
    );
  }

  static validateUserId(id) {
    return (
      typeof id === "string" &&
      STORAGE_CONSTANTS.VALIDATION_PATTERNS.USER_ID.test(id)
    );
  }

  static validateEmail(email) {
    return (
      typeof email === "string" &&
      STORAGE_CONSTANTS.VALIDATION_PATTERNS.EMAIL.test(email)
    );
  }

  static sanitizeString(str, maxLength = 1000) {
    if (typeof str !== "string") return "";
    return str.replace(/[<>]/g, "").substring(0, maxLength);
  }

  static validatePreferences(prefs) {
    if (!prefs || typeof prefs !== "object") return false;

    const validStructure = {
      accessibility: "object",
      simulation: "object",
      analytics: "object",
      theme: "object",
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
  static VERSION = STORAGE_CONSTANTS.VERSION;
  static storage = null;
  static sessionStorage = null;
  static memoryFallback = new Map();
  static eventListeners = new Map();
  static compressionEnabled = true;
  static encryptionEnabled = true;
  static syncEnabled = true;
  static lastSyncTime = 0;
  static quotaWarningThreshold = QUOTA_WARNING_THRESHOLD; // 80% of quota
  static isInitializing = false; // Track initialization state to prevent loops

  // Enhanced DataHandler Integration for Phase 2.4
  static dataHandler = null;

  /**
   * Enhanced constructor for DataHandler integration
   * @param {Object} app - Enhanced app instance with DataHandler
   */
  static initialize(app = null) {
    this.dataHandler = app?.dataHandler || null;
    if (this.dataHandler) {
      console.log("[StorageManager] DataHandler integration enabled");
    } else {
      console.log("[StorageManager] Using standalone mode");
    }
    return this.init();
  }

  /**
   * Get the full storage key with prefix
   */
  static getStorageKey(key) {
    return this.STORAGE_PREFIX + key;
  }

  /**
   * Initialize the enhanced storage system
   */
  static async init() {
    try {
      this.isInitializing = true; // Set initialization flag

      // Initialize encryption
      if (this.encryptionEnabled) {
        await StorageEncryption.generateKey();
      }

      // Check storage availability first
      if (
        !this.isStorageAvailable() ||
        !window.localStorage ||
        !window.sessionStorage
      ) {
        logger.warn("Local storage not available, using in-memory storage");
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

      // Recover from any corrupted system data
      try {
        // Check if system_backups exists and is potentially corrupted
        const rawData = this.storage.getItem(
          this.getStorageKey("system_backups"),
        );
        if (rawData) {
          try {
            const parsedData = JSON.parse(rawData);
            // If it has compression metadata but the data looks corrupted, clear it
            if (parsedData.metadata && parsedData.metadata.compressed) {
              // Don't actually decompress during init - just check if the data looks valid
              const compressedValue = parsedData.value;
              if (
                !compressedValue ||
                typeof compressedValue !== "string" ||
                compressedValue.length < 10
              ) {
                logger.warn(
                  "system_backups appears corrupted (invalid compressed data), clearing",
                );
                this.storage.removeItem(this.getStorageKey("system_backups"));
              }
            }
          } catch (parseError) {
            logger.warn(
              "system_backups contains invalid JSON, clearing:",
              parseError,
            );
            this.storage.removeItem(this.getStorageKey("system_backups"));
          }
        }
      } catch (error) {
        logger.warn("Error checking system_backups, clearing:", error);
        this.storage.removeItem(this.getStorageKey("system_backups"));
      }

      // Perform data migration
      await this.migrateData();

      // Cleanup old data
      this.cleanupOldData();

      logger.debug("Enhanced StorageManager initialized successfully");
      this.emit(STORAGE_EVENTS.DATA_UPDATED, { action: "initialized" });

      this.isInitializing = false; // Clear initialization flag
    } catch (error) {
      logger.error("Failed to initialize StorageManager:", error);
      this.handleError(error, "initialization");
      this.isInitializing = false; // Clear flag even on error
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
      this.sessionStorage.setItem = (key, value) =>
        this.sessionStorage.set(key, value);
      this.sessionStorage.getItem = (key) =>
        this.sessionStorage.get(key) || null;
      this.sessionStorage.removeItem = (key) => this.sessionStorage.delete(key);
      this.sessionStorage.clear = () => this.sessionStorage.clear();
    }
  }

  /**
   * Setup cross-tab synchronization
   */
  static setupCrossTabSync() {
    if (typeof window === "undefined" || !window.addEventListener) return;

    window.addEventListener("storage", (event) => {
      if (event.key && event.key.startsWith(this.STORAGE_PREFIX)) {
        const key = event.key.substring(this.STORAGE_PREFIX.length);
        this.emit(STORAGE_EVENTS.DATA_UPDATED, {
          key,
          oldValue: event.oldValue,
          newValue: event.newValue,
          source: "external",
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
    }, QUOTA_CHECK_INTERVAL); // Check every minute
  }

  /**
   * Check storage quota and warn if approaching limit
   */
  static async checkStorageQuota() {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usageRatio = estimate.usage / estimate.quota;

        if (usageRatio > this.quotaWarningThreshold) {
          logger.warn(`Storage quota ${(usageRatio * 100).toFixed(1)}% full`);
          this.emit(STORAGE_EVENTS.QUOTA_EXCEEDED, {
            usage: estimate.usage,
            quota: estimate.quota,
            ratio: usageRatio,
          });
        }
      }
    } catch (error) {
      logger.warn("Failed to check storage quota:", error);
    }
  }

  /**
   * OPTIMIZED: Sync check for cross-tab updates with state change detection
   */
  static syncCheck() {
    const currentTime = Date.now();
    // OPTIMIZED: Only update state if threshold exceeded, prevent unnecessary state mutations
    if (currentTime - this.lastSyncTime > STORAGE_CONSTANTS.SYNC_INTERVAL) {
      this.lastSyncTime = currentTime;
      // Perform any necessary sync operations only when needed
      this.performSyncOperations();
    }
  }

  /**
   * OPTIMIZED: Extracted sync operations to avoid inline processing
   */
  static performSyncOperations() {
    // Only emit events if there are actual changes to sync
    const hasChanges = this.detectCrossTabChanges();
    if (hasChanges) {
      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "cross_tab_sync",
        timestamp: Date.now(),
      });
    }
  }

  /**
   * OPTIMIZED: Detect if there are actual cross-tab changes
   */
  static detectCrossTabChanges() {
    // Implementation for change detection
    // Return false for now to prevent unnecessary events
    return false;
  } /**
   * Enhanced storage availability check
   */
  static isStorageAvailable() {
    try {
      // First check if localStorage exists and is not null
      if (!window.localStorage || !window.sessionStorage) {
        return false;
      }

      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);

      // Additional checks
      const testObj = { test: "data" };
      localStorage.setItem(test, JSON.stringify(testObj));
      const retrieved = JSON.parse(localStorage.getItem(test));
      localStorage.removeItem(test);

      return retrieved && retrieved.test === "data";
    } catch (e) {
      return false;
    }
  }

  /**
   * Enhanced data migration with versioning
   */
  static async migrateData() {
    try {
      const currentVersion = this.get("version");

      if (!currentVersion) {
        // First time initialization
        logger.debug("Initializing storage for first time");
        await this.performFirstTimeSetup();
      } else if (currentVersion !== this.VERSION) {
        logger.debug(
          `Migrating data from ${currentVersion} to ${this.VERSION}`,
        );
        await this.performMigration(currentVersion, this.VERSION);
      }

      this.set("version", this.VERSION);
      this.emit(STORAGE_EVENTS.DATA_MIGRATED, {
        from: currentVersion,
        to: this.VERSION,
      });
    } catch (error) {
      logger.error("Data migration failed:", error);
      this.handleError(error, "migration");
    }
  }

  /**
   * OPTIMIZED: First time setup with batched operations
   */
  static async performFirstTimeSetup() {
    // OPTIMIZED: Batch initial setup operations to reduce async overhead
    const defaultPreferences = this.getDefaultPreferences();

    // Execute setup operations in parallel where possible
    await Promise.all([
      this.saveUserPreferences(defaultPreferences),
      this.createBackup("initial_setup"),
    ]);

    logger.debug("First time setup completed");
  }

  /**
   * Perform version-specific migration
   */
  static async performMigration(fromVersion, toVersion) {
    try {
      // Version-specific migration logic
      if (fromVersion === "1.0" && toVersion === "2.0.0") {
        await this.migrateFrom1To2();
      }

      // Create migration backup
      await this.createBackup(`migration_${fromVersion}_to_${toVersion}`);
    } catch (error) {
      logger.error("Migration failed:", error);
      throw error;
    }
  }

  /**
   * Migrate from version 1.0 to 2.0
   */
  static async migrateFrom1To2() {
    // Migrate old preference structure
    const oldPrefs = this.get("user_preferences");
    if (oldPrefs) {
      const newPrefs = this.convertOldPreferences(oldPrefs);
      this.saveUserPreferences(newPrefs);
    }

    // Migrate decision format if needed
    const decisions = this.get("decisions", []);
    const migratedDecisions = decisions.map((decision) => ({
      ...decision,
      version: "2.0.0",
      migrated: true,
    }));

    this.set("decisions", migratedDecisions);
    logger.debug("Migration from 1.0 to 2.0 completed");
  }

  /**
   * Convert old preference structure to new format
   */
  static convertOldPreferences(oldPrefs) {
    return {
      ...oldPrefs,
      theme: {
        mode: "auto", // auto, light, dark, high-contrast
        reducedMotion: false,
        fontSize: "medium",
        colorScheme: "default",
      },
      accessibility: {
        ...oldPrefs.accessibility,
        screenReader: false,
        voiceOver: false,
        keyboardOnly: false,
      },
      privacy: {
        analyticsEnabled: oldPrefs.analytics?.allowTracking || false,
        personalDataCollection: false,
        thirdPartySharing: false,
      },
      performance: {
        enableAnimations: true,
        enableHaptics: true,
        preloadContent: true,
        compressionEnabled: true,
      },
    };
  } /**
   * Enhanced storage set method with compression and encryption
   * Integrates with DataHandler for Firebase sync when available
   */
  static async set(key, value, options = {}) {
    try {
      // DataHandler integration - save to DataHandler first if available
      if (this.dataHandler) {
        try {
          const success = await this.dataHandler.saveData(
            `storage_${key}`,
            value,
            {
              ...options,
              source: "StorageManager",
            },
          );
          if (success) {
            console.log(
              `[StorageManager] Data saved to DataHandler for key: ${key}`,
            );
            // Also save to local storage for immediate access and fallback
            await this.setLocal(key, value, options);
            return;
          }
        } catch (dataHandlerError) {
          console.warn(
            `[StorageManager] DataHandler failed for key '${key}', using local storage:`,
            dataHandlerError,
          );
        }
      }

      // Fallback to local storage
      await this.setLocal(key, value, options);
    } catch (error) {
      logger.error("Error in enhanced set method:", error);
      this.handleError(error, "set", { key, value });
      throw error;
    }
  }

  /**
   * Original local storage set method (renamed for internal use)
   */
  static async setLocal(key, value, options = {}) {
    try {
      const fullKey = this.STORAGE_PREFIX + key;
      let processedValue = value;

      // Validate key
      if (!key || typeof key !== "string") {
        throw new Error("Invalid storage key");
      }

      // Force safe options for system_backups to prevent corruption loops
      if (key === "system_backups") {
        options = {
          ...options,
          encrypt: false,
          compress: false,
        };
      }

      // Create metadata
      const metadata = {
        timestamp: Date.now(),
        version: this.VERSION,
        type: typeof value,
        compressed: false,
        encrypted: options.encrypt || false,
        ttl: options.ttl || null,
      };

      // OPTIMIZED: Single JSON.stringify operation, reuse serialized value
      const serialized = JSON.stringify(value);

      // Compress if enabled and data is large enough
      if (
        this.compressionEnabled &&
        serialized.length > STORAGE_CONSTANTS.COMPRESSION_THRESHOLD
      ) {
        try {
          // OPTIMIZED: Use serialized string directly to avoid re-serialization
          processedValue = await this.compressString(serialized);
          metadata.compressed = true;
        } catch (compressError) {
          logger.warn(
            "Compression failed, using uncompressed data:",
            compressError,
          );
          processedValue = value;
        }
      }

      // Encrypt sensitive data
      if (
        this.encryptionEnabled &&
        (options.encrypt || this.isSensitiveKey(key))
      ) {
        try {
          processedValue = await StorageEncryption.encrypt(processedValue);
          metadata.encrypted = true;
        } catch (encryptError) {
          logger.warn(
            "Encryption failed, using unencrypted data:",
            encryptError,
          );
        }
      }

      // Create final data structure
      const finalData = {
        value: processedValue,
        metadata,
      };

      const dataString = JSON.stringify(finalData);

      // Check size limits
      if (dataString.length > STORAGE_CONSTANTS.MAX_STORAGE_SIZE / 100) {
        logger.warn(
          `Large data detected for key '${key}': ${dataString.length} bytes`,
        );
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
        action: "set",
        size: dataString.length,
        metadata,
      });
    } catch (error) {
      logger.error("Error saving to local storage:", error);
      this.handleError(error, "setLocal", { key, value });
      throw error;
    }
  }

  /**
   * Enhanced storage get method with decompression and decryption
   * Integrates with DataHandler for Firebase sync when available
   */
  static async get(key, defaultValue = null) {
    try {
      // DataHandler integration - try DataHandler first if available
      if (this.dataHandler) {
        try {
          const data = await this.dataHandler.getData(`storage_${key}`);
          if (data !== null && data !== undefined) {
            console.log(
              `[StorageManager] Data retrieved from DataHandler for key: ${key}`,
            );
            return data;
          }
        } catch (dataHandlerError) {
          console.warn(
            `[StorageManager] DataHandler failed for key '${key}', using local storage:`,
            dataHandlerError,
          );
        }
      }

      // Fallback to local storage
      return await this.getLocal(key, defaultValue);
    } catch (error) {
      logger.error("Error in enhanced get method:", error);
      this.handleError(error, "get", { key });
      return defaultValue;
    }
  }

  /**
   * Original local storage get method (renamed for internal use)
   */
  static async getLocal(key, defaultValue = null) {
    try {
      const fullKey = this.STORAGE_PREFIX + key;

      // Validate key
      if (!key || typeof key !== "string") {
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
        logger.warn(
          `Invalid JSON data for key '${key}', returning default value`,
        );
        return defaultValue;
      }

      // Handle legacy data format
      if (!parsedData.metadata) {
        return parsedData.value || parsedData;
      }

      // Check TTL
      if (parsedData.metadata.ttl) {
        const expireTime =
          parsedData.metadata.timestamp + parsedData.metadata.ttl;
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
          logger.error(
            `Failed to decrypt data for key '${key}':`,
            decryptError,
          );
          return defaultValue;
        }
      }

      // Decompress if needed
      if (parsedData.metadata.compressed) {
        // Proactive corruption detection before attempting decompression
        if (!this.isValidCompressedData(finalValue)) {
          logger.warn(
            `Proactively detected corruption in compressed data for key '${key}', clearing`,
          );
          this.storage.removeItem(this.getStorageKey(key));
          return defaultValue;
        }

        try {
          finalValue = await this.decompress(finalValue);
        } catch (decompressError) {
          logger.error(
            `Failed to decompress data for key '${key}':`,
            decompressError,
          );
          // Clear the corrupted data immediately to prevent further issues
          logger.info(`Clearing corrupted data for key: ${key}`);
          this.storage.removeItem(this.getStorageKey(key));
          return defaultValue;
        }
      }

      return finalValue;
    } catch (error) {
      logger.error("Error reading from local storage:", error);
      this.handleError(error, "getLocal", { key });
      return defaultValue;
    }
  }

  /**
   * Enhanced remove method with cleanup
   * Integrates with DataHandler for Firebase sync when available
   */
  static async remove(key) {
    try {
      // DataHandler integration - remove from DataHandler first if available
      if (this.dataHandler) {
        try {
          const success = await this.dataHandler.removeData(`storage_${key}`);
          if (success) {
            console.log(
              `[StorageManager] Data removed from DataHandler for key: ${key}`,
            );
          }
        } catch (dataHandlerError) {
          console.warn(
            `[StorageManager] DataHandler removal failed for key '${key}':`,
            dataHandlerError,
          );
        }
      }

      // Always remove from local storage as well
      this.removeLocal(key);
    } catch (error) {
      logger.error("Error in enhanced remove method:", error);
      this.handleError(error, "remove", { key });
    }
  }

  /**
   * Original local storage remove method (renamed for internal use)
   */
  static removeLocal(key) {
    try {
      const fullKey = this.STORAGE_PREFIX + key;

      if (this.storage instanceof Map) {
        const existed = this.storage.has(fullKey);
        this.storage.delete(fullKey);

        if (existed) {
          this.emit(STORAGE_EVENTS.DATA_UPDATED, {
            key,
            action: "remove",
          });
        }
      } else {
        const existed = this.storage.getItem(fullKey) !== null;
        this.storage.removeItem(fullKey);

        if (existed) {
          this.emit(STORAGE_EVENTS.DATA_UPDATED, {
            key,
            action: "remove",
          });
        }
      }
    } catch (error) {
      logger.error("Error removing from local storage:", error);
      this.handleError(error, "removeLocal", { key });
    }
  }

  /**
   * Enhanced clear method with DataHandler integration
   */
  static async clear() {
    try {
      // Clear from DataHandler if available
      if (this.dataHandler) {
        try {
          // Get all storage keys that start with 'storage_' prefix
          // Note: DataHandler doesn't have a clear method, so we'll need to implement this differently
          console.log(
            `[StorageManager] DataHandler clear not implemented - only clearing local storage`,
          );
        } catch (dataHandlerError) {
          console.warn(
            `[StorageManager] DataHandler clear failed:`,
            dataHandlerError,
          );
        }
      }

      // Clear local storage
      this.clearLocal();
    } catch (error) {
      logger.error("Error in enhanced clear method:", error);
    }
  }

  /**
   * Original local storage clear method (renamed for internal use)
   */
  static clearLocal() {
    try {
      if (this.storage instanceof Map) {
        this.storage.clear();
      } else {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.STORAGE_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (e) {
      logger.error("Error clearing storage:", e);
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
      logger.error("Error saving to session storage:", e);
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
      logger.error("Error reading from session storage:", e);
    }

    return defaultValue;
  } /**
   * Enhanced user preferences with validation and theme integration
   */
  static async saveUserPreferences(preferences) {
    try {
      // Validate preferences structure
      if (!StorageValidator.validatePreferences(preferences)) {
        throw new Error("Invalid preferences structure");
      }

      // Merge with existing preferences to avoid overwriting
      const currentPrefs = await this.getUserPreferences();
      const mergedPrefs = this.deepMerge(currentPrefs, preferences);

      // Add metadata
      mergedPrefs._metadata = {
        lastUpdated: Date.now(),
        version: this.VERSION,
        source: "user",
      };

      await this.set("user_preferences", mergedPrefs, { encrypt: true });

      // Emit preferences change event
      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        key: "user_preferences",
        action: "update",
        data: mergedPrefs,
      });
    } catch (error) {
      logger.error("Failed to save user preferences:", error);
      this.handleError(error, "saveUserPreferences", { preferences });
      throw error;
    }
  }

  static async getUserPreferences() {
    try {
      const preferences = await this.get("user_preferences");

      if (preferences) {
        // Validate and migrate if necessary
        if (!StorageValidator.validatePreferences(preferences)) {
          logger.warn("Invalid preferences found, using defaults");
          return this.getDefaultPreferences();
        }

        // Merge with defaults to ensure all properties exist
        return this.deepMerge(this.getDefaultPreferences(), preferences);
      }

      return this.getDefaultPreferences();
    } catch (error) {
      logger.error("Failed to get user preferences:", error);
      this.handleError(error, "getUserPreferences");
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
        colorBlindSupport: false,
      },
      theme: {
        mode: "auto", // auto, light, dark, high-contrast
        reducedMotion: false,
        fontSize: "medium",
        colorScheme: "default",
        customColors: null,
      },
      simulation: {
        showHints: true,
        autoAdvance: false,
        soundEnabled: true,
        hapticFeedback: true,
        pauseOnFocusLoss: true,
        skipAnimations: false,
        difficulty: "adaptive",
      },
      privacy: {
        analyticsEnabled: false,
        personalDataCollection: false,
        thirdPartySharing: false,
        cookiesEnabled: true,
        dataRetention: 30, // days
      },
      performance: {
        enableAnimations: true,
        enableHaptics: true,
        preloadContent: true,
        compressionEnabled: true,
        qualityMode: "balanced", // performance, balanced, quality
      },
      analytics: {
        allowTracking: false,
        detailedTracking: false,
        errorReporting: true,
        usageStatistics: false,
      },
    };
  }

  /**
   * Deep merge objects
   */
  static deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
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
      logger.error("Failed to update preference:", error);
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
      logger.error("Failed to get preference:", error);
      return defaultValue;
    }
  }

  /**
   * Apply theme preferences to DOM - Coordinates with CSS class system
   * This method provides the interface between storage and DOM manipulation
   */
  static async applyThemePreferences(preferences = null) {
    try {
      const prefs = preferences || (await this.getUserPreferences());

      if (!prefs || !prefs.theme) {
        logger.warn("No theme preferences found, applying defaults");
        return false;
      }

      // Emit theme change event with CSS class information
      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "theme_preferences_updated",
        theme: prefs.theme,
        accessibility: prefs.accessibility,
        cssClasses: this.getThemeCSSClasses(prefs),
        cssProperties: this.getThemeCSSProperties(prefs),
        timestamp: Date.now(),
      });

      return true;
    } catch (error) {
      this.handleError(error, "applyThemePreferences", { preferences });
      return false;
    }
  }

  /**
   * Get CSS classes that should be applied based on current preferences
   */
  static getThemeCSSClasses(preferences = null) {
    if (!preferences) return [];

    const classes = [];
    const { theme, accessibility, performance } = preferences;

    // Theme mode classes
    if (theme?.mode) {
      switch (theme.mode) {
        case "dark":
          classes.push(CSS_CLASSES.DARK_MODE);
          break;
        case "light":
          classes.push(CSS_CLASSES.LIGHT_MODE);
          break;
        case "high-contrast":
          classes.push(CSS_CLASSES.HIGH_CONTRAST);
          break;
        case "auto":
          classes.push(CSS_CLASSES.AUTO_THEME);
          break;
      }
    }

    // Font size classes
    if (theme?.fontSize) {
      switch (theme.fontSize) {
        case "small":
          classes.push(CSS_CLASSES.FONT_SMALL);
          break;
        case "medium":
          classes.push(CSS_CLASSES.FONT_MEDIUM);
          break;
        case "large":
          classes.push(CSS_CLASSES.FONT_LARGE);
          break;
        case "extra-large":
          classes.push(CSS_CLASSES.FONT_EXTRA_LARGE);
          break;
      }
    }

    // Accessibility classes
    if (accessibility?.keyboardOnly) {
      classes.push(CSS_CLASSES.KEYBOARD_USER);
    }
    if (accessibility?.largeText) {
      classes.push(CSS_CLASSES.LARGE_TEXT);
    }
    if (accessibility?.reducedMotion || theme?.reducedMotion) {
      classes.push(CSS_CLASSES.REDUCED_MOTION);
    }
    if (accessibility?.colorBlindSupport) {
      classes.push(CSS_CLASSES.COLOR_BLIND_SUPPORT);
    }

    // Performance classes
    if (performance?.enableAnimations === false) {
      classes.push(CSS_CLASSES.NO_ANIMATIONS);
    }
    if (performance?.qualityMode === "performance") {
      classes.push(CSS_CLASSES.HIGH_PERFORMANCE);
    }
    if (performance?.qualityMode === "quality") {
      classes.push(CSS_CLASSES.QUALITY_MODE);
    }

    return classes;
  }

  /**
   * Get CSS custom properties that should be updated based on preferences
   */
  static getThemeCSSProperties(preferences = null) {
    if (!preferences) return {};

    const properties = {};
    const { theme, accessibility } = preferences;

    // Font scaling
    if (accessibility?.largeText) {
      properties[CSS_PROPERTIES.FONT_SCALE] = "1.2";
    } else if (theme?.fontSize === "small") {
      properties[CSS_PROPERTIES.FONT_SCALE] = "0.9";
    } else if (theme?.fontSize === "large") {
      properties[CSS_PROPERTIES.FONT_SCALE] = "1.1";
    } else if (theme?.fontSize === "extra-large") {
      properties[CSS_PROPERTIES.FONT_SCALE] = "1.3";
    }

    // Custom colors
    if (theme?.customColors) {
      if (theme.customColors.primary) {
        properties[CSS_PROPERTIES.COLOR_PRIMARY] = theme.customColors.primary;
      }
      if (theme.customColors.secondary) {
        properties[CSS_PROPERTIES.COLOR_SECONDARY] =
          theme.customColors.secondary;
      }
      if (theme.customColors.background) {
        properties[CSS_PROPERTIES.COLOR_BACKGROUND] =
          theme.customColors.background;
      }
      if (theme.customColors.text) {
        properties[CSS_PROPERTIES.COLOR_TEXT] = theme.customColors.text;
      }
    }

    return properties;
  }

  /**
   * Get CSS class name constants for external use
   */
  static getCSSClasses() {
    return { ...CSS_CLASSES };
  }

  /**
   * Get CSS property name constants for external use
   */
  static getCSSProperties() {
    return { ...CSS_PROPERTIES };
  }

  /**
   * Update theme preferences and automatically apply them
   */
  static async updateThemePreferences(themeUpdates) {
    try {
      const currentPrefs = await this.getUserPreferences();
      const updatedPrefs = {
        ...currentPrefs,
        theme: {
          ...currentPrefs.theme,
          ...themeUpdates,
        },
      };

      await this.saveUserPreferences(updatedPrefs);
      await this.applyThemePreferences(updatedPrefs);

      return true;
    } catch (error) {
      this.handleError(error, "updateThemePreferences", { themeUpdates });
      return false;
    }
  }

  /**
   * Update accessibility preferences and automatically apply them
   */
  static async updateAccessibilityPreferences(accessibilityUpdates) {
    try {
      const currentPrefs = await this.getUserPreferences();
      const updatedPrefs = {
        ...currentPrefs,
        accessibility: {
          ...currentPrefs.accessibility,
          ...accessibilityUpdates,
        },
      };

      await this.saveUserPreferences(updatedPrefs);
      await this.applyThemePreferences(updatedPrefs);

      return true;
    } catch (error) {
      this.handleError(error, "updateAccessibilityPreferences", {
        accessibilityUpdates,
      });
      return false;
    }
  }

  // User progress methods - modernized with async, validation, and encryption
  static async saveUserProgress(simulationId, progress) {
    try {
      // Validate simulation ID
      if (!StorageValidator.validateSimulationId(simulationId)) {
        throw new Error("Invalid simulation ID format");
      }

      // Validate progress data
      if (!progress || typeof progress !== "object") {
        throw new Error("Invalid progress data");
      }

      const allProgress = await this.get("user_progress", {});
      allProgress[simulationId] = {
        ...progress,
        lastUpdated: Date.now(),
        version: this.VERSION,
      };

      await this.set("user_progress", allProgress, {
        encrypt: this.isSensitiveKey("user_progress"),
        compress: true,
      });

      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "progress_saved",
        simulationId,
        timestamp: Date.now(),
      });

      logger.debug(`User progress saved for simulation: ${simulationId}`);
    } catch (error) {
      this.handleError(error, "saveUserProgress", { simulationId });
      throw error;
    }
  }

  static async getUserProgress(simulationId = null) {
    try {
      if (
        simulationId &&
        !StorageValidator.validateSimulationId(simulationId)
      ) {
        throw new Error("Invalid simulation ID format");
      }

      const allProgress = await this.get("user_progress", {});
      return simulationId ? allProgress[simulationId] : allProgress;
    } catch (error) {
      this.handleError(error, "getUserProgress", { simulationId });
      return simulationId ? null : {};
    }
  }

  static async resetUserProgress(simulationId = null) {
    try {
      if (simulationId) {
        if (!StorageValidator.validateSimulationId(simulationId)) {
          throw new Error("Invalid simulation ID format");
        }

        const allProgress = await this.get("user_progress", {});
        delete allProgress[simulationId];
        await this.set("user_progress", allProgress);

        this.emit(STORAGE_EVENTS.DATA_UPDATED, {
          action: "progress_reset",
          simulationId,
          timestamp: Date.now(),
        });
      } else {
        this.remove("user_progress");
        this.emit(STORAGE_EVENTS.DATA_UPDATED, {
          action: "all_progress_reset",
          timestamp: Date.now(),
        });
      }

      logger.debug(
        `User progress reset${simulationId ? ` for ${simulationId}` : " (all)"}`,
      );
    } catch (error) {
      this.handleError(error, "resetUserProgress", { simulationId });
      throw error;
    }
  }

  // Enhanced decision logging with validation and analytics
  static async logDecision(decision) {
    try {
      // Validate decision data
      if (!decision || typeof decision !== "object") {
        throw new Error("Invalid decision data");
      }

      if (
        decision.simulationId &&
        !StorageValidator.validateSimulationId(decision.simulationId)
      ) {
        throw new Error("Invalid simulation ID in decision");
      }

      const decisions = await this.get("decisions", []);
      const enrichedDecision = {
        ...decision,
        id: this.generateUniqueId("decision"),
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        version: this.VERSION,
        sanitizedContext: StorageValidator.sanitizeString(
          decision.context || "",
          LIMIT_CONSTANTS.DEFAULT_STRING_LIMIT,
        ),
      };

      decisions.push(enrichedDecision);

      // Keep only last 1000 decisions for performance
      if (decisions.length > LIMIT_CONSTANTS.DECISION_LIMIT) {
        decisions.splice(0, decisions.length - LIMIT_CONSTANTS.DECISION_LIMIT);
      }

      await this.set("decisions", decisions, {
        encrypt: this.isSensitiveKey("decisions"),
        compress: true,
      });

      // Track analytics
      await this.trackAnalyticsEvent("decision_logged", {
        simulationId: decision.simulationId,
        category: decision.category,
        ethicsImpact: decision.ethicsImpact,
      });

      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "decision_logged",
        decisionId: enrichedDecision.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error, "logDecision", { decision });
      throw error;
    }
  }

  static async getDecisions(simulationId = null, limit = null) {
    try {
      if (
        simulationId &&
        !StorageValidator.validateSimulationId(simulationId)
      ) {
        throw new Error("Invalid simulation ID format");
      }

      const decisions = await this.get("decisions", []);

      let filtered = decisions;
      if (simulationId) {
        filtered = decisions.filter((d) => d.simulationId === simulationId);
      }

      if (limit && typeof limit === "number" && limit > 0) {
        filtered = filtered.slice(-limit);
      }

      return filtered;
    } catch (error) {
      this.handleError(error, "getDecisions", { simulationId, limit });
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
          neutral: 0,
        },
        timeRange: {
          earliest: null,
          latest: null,
        },
      };

      let totalTime = 0;
      const timestamps = [];

      decisions.forEach((decision) => {
        // Category stats
        const category = decision.category || "unknown";
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // Simulation stats
        if (decision.simulationId) {
          stats.bySimulation[decision.simulationId] =
            (stats.bySimulation[decision.simulationId] || 0) + 1;
        }

        // Ethics impact
        const impact = decision.ethicsImpact || "neutral";
        if (stats.ethicsImpact[impact] !== undefined) {
          stats.ethicsImpact[impact]++;
        }

        // Timing
        if (decision.timestamp) {
          timestamps.push(decision.timestamp);
          if (decision.timeSpent && typeof decision.timeSpent === "number") {
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
        stats.timeRange.latest = new Date(
          timestamps[timestamps.length - 1],
        ).toISOString();
      }

      return stats;
    } catch (error) {
      this.handleError(error, "getDecisionStats", { simulationId });
      return {
        total: 0,
        byCategory: {},
        bySimulation: {},
        avgTimePerDecision: 0,
        ethicsImpact: { positive: 0, negative: 0, neutral: 0 },
        timeRange: { earliest: null, latest: null },
      };
    }
  }

  // Enhanced simulation completion tracking
  static async markSimulationComplete(simulationId, report) {
    try {
      if (!StorageValidator.validateSimulationId(simulationId)) {
        throw new Error("Invalid simulation ID format");
      }

      if (!report || typeof report !== "object") {
        throw new Error("Invalid completion report");
      }

      const completion = {
        id: simulationId,
        completedAt: Date.now(),
        score: report.score || 0,
        feedback: StorageValidator.sanitizeString(report.feedback || "", 1000),
        ethicsRating: report.ethicsRating || "unknown",
        timeSpent: report.timeSpent || 0,
        decisionCount: report.decisionCount || 0,
        version: this.VERSION,
      };

      const completions = await this.get("completed_simulations", []);

      // Remove any previous completion for this simulation
      const existingIndex = completions.findIndex((c) => c.id === simulationId);
      if (existingIndex > -1) {
        completions.splice(existingIndex, 1);
      }

      completions.push(completion);
      await this.set("completed_simulations", completions, {
        encrypt: this.isSensitiveKey("completed_simulations"),
        compress: true,
      });

      // Update progress
      await this.saveUserProgress(simulationId, {
        completed: true,
        score: completion.score,
        completedAt: completion.completedAt,
        ethicsRating: completion.ethicsRating,
      });

      // Track analytics
      await this.trackAnalyticsEvent("simulation_completed", {
        simulationId,
        score: completion.score,
        timeSpent: completion.timeSpent,
        decisionCount: completion.decisionCount,
      });

      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "simulation_completed",
        simulationId,
        timestamp: Date.now(),
      });

      logger.debug(`Simulation ${simulationId} marked as complete`);
    } catch (error) {
      this.handleError(error, "markSimulationComplete", { simulationId });
      throw error;
    }
  }

  static async getCompletedSimulations() {
    try {
      return await this.get("completed_simulations", []);
    } catch (error) {
      this.handleError(error, "getCompletedSimulations");
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
      this.handleError(error, "isSimulationCompleted", { simulationId });
      return false;
    }
  }

  // Enhanced analytics with async support and validation
  static async trackAnalyticsEvent(eventType, data = {}) {
    try {
      if (!eventType || typeof eventType !== "string") {
        throw new Error("Invalid event type");
      }

      const event = {
        type: eventType,
        data,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
        userAgent: navigator.userAgent,
        url: window.location?.href || "unknown",
        version: this.VERSION,
      };

      const events = this.getSession("analytics_events", []);
      events.push(event);

      // Keep only last 100 events in session for performance
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }

      this.setSession("analytics_events", events);

      // Also store persistent analytics summary
      await this.updateAnalyticsSummary(eventType, data);

      logger.debug(`Analytics event tracked: ${eventType}`);
    } catch (error) {
      this.handleError(error, "trackAnalyticsEvent", { eventType, data });
    }
  }

  static async updateAnalyticsSummary(eventType, data) {
    try {
      const summary = await this.get("analytics_summary", {
        totalEvents: 0,
        eventTypes: {},
        lastUpdated: Date.now(),
      });

      summary.totalEvents++;
      summary.eventTypes[eventType] = (summary.eventTypes[eventType] || 0) + 1;
      summary.lastUpdated = Date.now();

      // OPTIMIZED: Only update analytics if data contains meaningful information
      if (data && Object.keys(data).length > 0) {
        summary.lastEventData = {
          type: eventType,
          timestamp: Date.now(),
          hasData: true,
        };
      }

      await this.set("analytics_summary", summary, {
        encrypt: this.isSensitiveKey("analytics_summary"),
        compress: true,
      });
    } catch (error) {
      logger.warn("Failed to update analytics summary:", error);
    }
  }

  static getAnalyticsEvents() {
    return this.getSession("analytics_events", []);
  }

  static async getAnalyticsSummary() {
    try {
      return await this.get("analytics_summary", {
        totalEvents: 0,
        eventTypes: {},
        lastUpdated: null,
      });
    } catch (error) {
      this.handleError(error, "getAnalyticsSummary");
      return { totalEvents: 0, eventTypes: {}, lastUpdated: null };
    }
  }

  // Backup and restore functionality
  static async createBackup(label = "manual_backup") {
    // Skip backup creation during initialization to prevent loops
    if (this.isInitializing) {
      logger.debug("Skipping backup creation during initialization");
      return null;
    }
    try {
      const backupData = {
        version: this.VERSION,
        label: StorageValidator.sanitizeString(
          label,
          LIMIT_CONSTANTS.LABEL_STRING_LIMIT,
        ),
        createdAt: Date.now(),
        data: {
          preferences: await this.getUserPreferences(),
          progress: await this.getUserProgress(),
          decisions: await this.getDecisions(),
          completions: await this.getCompletedSimulations(),
          analyticsSummary: await this.getAnalyticsSummary(),
        },
      };

      const backups = await this.get("system_backups", []);

      // Add backup ID
      backupData.id = this.generateUniqueId("backup");

      backups.push(backupData);

      // Keep only last 10 backups to manage storage
      if (backups.length > 10) {
        backups.splice(0, backups.length - 10);
      }

      await this.set("system_backups", backups, {
        encrypt: false, // Temporarily disable to prevent corruption loop
        compress: false, // Temporarily disable to prevent corruption loop
      });

      this.emit(STORAGE_EVENTS.BACKUP_CREATED, {
        backupId: backupData.id,
        label,
        timestamp: Date.now(),
      });

      logger.debug(`Backup created: ${label} (${backupData.id})`);
      return backupData.id;
    } catch (error) {
      this.handleError(error, "createBackup", { label });
      throw error;
    }
  }

  static async getBackups() {
    try {
      const backups = await this.get("system_backups", []);
      // Return metadata only, not full data
      return backups.map((backup) => ({
        id: backup.id,
        label: backup.label,
        createdAt: backup.createdAt,
        version: backup.version,
        dataSize: JSON.stringify(backup.data).length,
      }));
    } catch (error) {
      this.handleError(error, "getBackups");
      return [];
    }
  }

  static async restoreFromBackup(backupId) {
    try {
      if (!backupId || typeof backupId !== "string") {
        throw new Error("Invalid backup ID");
      }

      const backups = await this.get("system_backups", []);
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error("Backup not found");
      }

      // Create a backup of current state before restoring
      await this.createBackup(`pre_restore_${Date.now()}`);

      // Restore data
      const { data } = backup;

      if (data.preferences) {
        await this.saveUserPreferences(data.preferences);
      }

      if (data.progress) {
        await this.set("user_progress", data.progress);
      }

      if (data.decisions) {
        await this.set("decisions", data.decisions);
      }

      if (data.completions) {
        await this.set("completed_simulations", data.completions);
      }

      if (data.analyticsSummary) {
        await this.set("analytics_summary", data.analyticsSummary);
      }

      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "backup_restored",
        backupId,
        timestamp: Date.now(),
      });

      logger.debug(`Data restored from backup: ${backupId}`);
      return true;
    } catch (error) {
      this.handleError(error, "restoreFromBackup", { backupId });
      throw error;
    }
  }

  static async deleteBackup(backupId) {
    try {
      if (!backupId || typeof backupId !== "string") {
        throw new Error("Invalid backup ID");
      }

      const backups = await this.get("system_backups", []);
      const index = backups.findIndex((b) => b.id === backupId);

      if (index === -1) {
        throw new Error("Backup not found");
      }

      backups.splice(index, 1);
      await this.set("system_backups", backups, {
        encrypt: false,
        compress: false,
      });

      logger.debug(`Backup deleted: ${backupId}`);
      return true;
    } catch (error) {
      this.handleError(error, "deleteBackup", { backupId });
      throw error;
    }
  }

  static async clearBackups() {
    try {
      this.remove("system_backups");
      logger.debug("All backups cleared");
      return true;
    } catch (error) {
      this.handleError(error, "clearBackups");
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
        completions: await this.getCompletedSimulations(),
      };

      if (includeAnalytics) {
        data.analyticsSummary = await this.getAnalyticsSummary();
      }

      // Track export event
      await this.trackAnalyticsEvent("data_exported", {
        includeAnalytics,
        dataSize: JSON.stringify(data).length,
      });

      return JSON.stringify(data, null, 2);
    } catch (error) {
      this.handleError(error, "exportData");
      throw error;
    }
  }

  static async importData(jsonData, options = {}) {
    try {
      if (!jsonData || typeof jsonData !== "string") {
        throw new Error("Invalid JSON data");
      }

      const data = JSON.parse(jsonData);

      // Validate data structure
      if (!data.version) {
        throw new Error("Invalid data format - missing version");
      }

      // Create backup before import
      if (options.createBackup !== false) {
        await this.createBackup(`pre_import_${Date.now()}`);
      }

      // Import data with validation
      let importedItems = 0;

      if (
        data.preferences &&
        StorageValidator.validatePreferences(data.preferences)
      ) {
        await this.saveUserPreferences(data.preferences);
        importedItems++;
      }

      if (data.progress && typeof data.progress === "object") {
        await this.set("user_progress", data.progress);
        importedItems++;
      }

      if (data.decisions && Array.isArray(data.decisions)) {
        await this.set("decisions", data.decisions);
        importedItems++;
      }

      if (data.completions && Array.isArray(data.completions)) {
        await this.set("completed_simulations", data.completions);
        importedItems++;
      }

      if (data.analyticsSummary && typeof data.analyticsSummary === "object") {
        await this.set("analytics_summary", data.analyticsSummary);
        importedItems++;
      }

      // Track import event
      await this.trackAnalyticsEvent("data_imported", {
        importedItems,
        dataVersion: data.version,
        importOptions: options,
      });

      this.emit(STORAGE_EVENTS.DATA_UPDATED, {
        action: "data_imported",
        importedItems,
        timestamp: Date.now(),
      });

      logger.debug(
        `Data imported successfully. Items imported: ${importedItems}`,
      );
      return { success: true, importedItems };
    } catch (error) {
      this.handleError(error, "importData", { options });
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
      logger.error("Error calculating storage size:", error);
    }

    return totalSize;
  }

  static async cleanupOldData(olderThanDays = 30) {
    try {
      const cutoffTime =
        Date.now() -
        olderThanDays *
          TIME_CONSTANTS.HOURS_PER_DAY *
          TIME_CONSTANTS.MINUTES_PER_HOUR *
          TIME_CONSTANTS.SECONDS_PER_MINUTE *
          TIME_CONSTANTS.MS_PER_SECOND;
      let cleanedItems = 0;

      // Clean old decisions
      const decisions = await this.get("decisions", []);
      const recentDecisions = decisions.filter((d) => d.timestamp > cutoffTime);
      if (recentDecisions.length !== decisions.length) {
        await this.set("decisions", recentDecisions);
        cleanedItems += decisions.length - recentDecisions.length;
      }

      // Clean old session data
      if (this.sessionStorage) {
        try {
          const analyticsEvents = this.getSession("analytics_events", []);
          const recentEvents = analyticsEvents.filter(
            (e) => e.timestamp > cutoffTime,
          );
          if (recentEvents.length !== analyticsEvents.length) {
            this.setSession("analytics_events", recentEvents);
            cleanedItems += analyticsEvents.length - recentEvents.length;
          }
        } catch (error) {
          logger.warn("Failed to clean session analytics:", error);
        }
      }

      // Clean old backups (keep only recent ones)
      const backupCutoff =
        Date.now() -
        STORAGE_CONSTANTS.BACKUP_RETENTION_DAYS *
          TIME_CONSTANTS.HOURS_PER_DAY *
          TIME_CONSTANTS.MINUTES_PER_HOUR *
          TIME_CONSTANTS.SECONDS_PER_MINUTE *
          TIME_CONSTANTS.MS_PER_SECOND;
      const backups = await this.get("system_backups", []);
      const recentBackups = backups.filter((b) => b.createdAt > backupCutoff);
      if (recentBackups.length !== backups.length) {
        // Use safe storage options to prevent corruption loop
        await this.set("system_backups", recentBackups, {
          encrypt: false,
          compress: false,
        });
        cleanedItems += backups.length - recentBackups.length;
      }

      // Track cleanup
      await this.trackAnalyticsEvent("data_cleanup", {
        olderThanDays,
        cleanedItems,
        cutoffTime,
      });

      logger.debug(
        `Cleaned ${cleanedItems} old data items (older than ${olderThanDays} days)`,
      );
      return cleanedItems;
    } catch (error) {
      this.handleError(error, "cleanupOldData", { olderThanDays });
      return 0;
    }
  }

  /**
   * Get or generate a session identifier
   */
  static getSessionId() {
    // Try to get existing session ID from session storage
    let sessionId = this.getSession("session_id");

    if (!sessionId) {
      // Generate new session ID
      sessionId = this.generateUniqueId("session");
      this.setSession("session_id", sessionId);
    }

    return sessionId;
  }

  /**
   * OPTIMIZED: Generate unique ID with cached random suffix to reduce repeated calculations
   */
  static generateUniqueId(prefix = "id") {
    const timestamp = Date.now();
    const randomSuffix = Math.random()
      .toString(FORMAT_CONSTANTS.DECIMAL_RADIX)
      .substr(
        FORMAT_CONSTANTS.SUBSTRING_START,
        FORMAT_CONSTANTS.ID_SUFFIX_LENGTH,
      );
    return `${prefix}_${timestamp}_${randomSuffix}`;
  }

  /**
   * Check if a key contains sensitive data that should be encrypted
   */
  static isSensitiveKey(key) {
    const sensitiveKeys = [
      "user_credentials",
      "personal_data",
      "analytics_data",
      "email",
      "user_id",
      "session_token",
    ];
    return sensitiveKeys.some((sensitive) => key.includes(sensitive));
  }

  /**
   * OPTIMIZED: Compress pre-serialized string data to avoid double JSON.stringify
   */
  static async compressString(jsonString) {
    if (!window.CompressionStream) {
      // Fallback: simple string compression
      return this.simpleCompress(jsonString);
    }

    try {
      const stream = new CompressionStream("gzip");
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

      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0),
      );
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      return Array.from(compressed);
    } catch (error) {
      logger.warn("Native compression failed, using fallback:", error);
      return this.simpleCompress(jsonString);
    }
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
      const stream = new CompressionStream("gzip");
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

      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0),
      );
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      return Array.from(compressed);
    } catch (error) {
      logger.warn("Native compression failed, using fallback:", error);
      return this.simpleCompress(JSON.stringify(data));
    }
  }

  /**
   * Proactively validate compressed data before attempting decompression
   * @param {string} compressedData - The compressed data to validate
   * @returns {boolean} - True if data appears valid, false if corrupted
   */
  static isValidCompressedData(compressedData) {
    try {
      // Basic type and existence checks
      if (!compressedData || typeof compressedData !== "string") {
        return false;
      }

      // Check minimum length (valid compressed data should be longer than 10 chars)
      if (compressedData.length < 10) {
        return false;
      }

      // Check for valid base64-like structure (compressed data is often base64 encoded)
      // Allow alphanumeric, +, /, =, and some punctuation that might appear in compressed data
      const base64Pattern = /^[A-Za-z0-9+/=\-_.~!*'();:@&$,?#[\]]*$/;
      if (!base64Pattern.test(compressedData)) {
        return false;
      }

      // Check for obvious corruption patterns
      const corruptionPatterns = [/^null$/, /^undefined$/, /^NaN$/, /^\s*$/];

      for (const pattern of corruptionPatterns) {
        if (pattern.test(compressedData)) {
          return false;
        }
      }

      // Check for control characters (ASCII 0-31, excluding common whitespace)
      const ASCII_CONTROL_MAX = 31;
      const ASCII_TAB = 9;
      const ASCII_NEWLINE = 10;
      const ASCII_CARRIAGE_RETURN = 13;

      for (let i = 0; i < compressedData.length; i++) {
        const charCode = compressedData.charCodeAt(i);
        if (
          charCode >= 0 &&
          charCode <= ASCII_CONTROL_MAX &&
          charCode !== ASCII_TAB &&
          charCode !== ASCII_NEWLINE &&
          charCode !== ASCII_CARRIAGE_RETURN
        ) {
          // Found invalid control character
          return false;
        }
      }

      // All checks passed - data appears valid
      return true;
    } catch (error) {
      // If validation itself fails, assume corruption
      logger.warn("Error during compressed data validation:", error);
      return false;
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
      const stream = new DecompressionStream("gzip");
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

      const decompressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0),
      );
      let offset = 0;
      for (const chunk of chunks) {
        decompressed.set(chunk, offset);
        offset += chunk.length;
      }

      const jsonString = new TextDecoder().decode(decompressed);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn("Native decompression failed, using fallback:", error);
      try {
        return JSON.parse(this.simpleDecompress(compressedData));
      } catch (fallbackError) {
        logger.error(
          "Both native and fallback decompression failed:",
          fallbackError,
        );
        throw new Error("Data corruption: Unable to decompress data");
      }
    }
  }

  /**
   * Simple compression fallback using Run-Length Encoding
   */
  static simpleCompress(str) {
    if (typeof str !== "string") return str;

    let compressed = "";
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
    try {
      if (typeof compressed !== "string") return compressed;

      let decompressed = "";
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
    } catch (error) {
      logger.error("Simple decompression failed:", error);
      throw new Error("Fallback decompression failed: Data is corrupted");
    }
  }

  /**
   * Recovery mechanism for corrupted data
   */
  static async recoverFromCorruption(key, fallbackValue = null) {
    try {
      logger.warn(`Attempting to recover corrupted data for key: ${key}`);

      // Remove the corrupted data
      this.remove(key);

      // If it's system_backups, clear it entirely
      if (key === "system_backups") {
        logger.info("Clearing corrupted system_backups data");
        return [];
      }

      // For other data, try to restore from a backup if available
      try {
        const backups = await this.get("system_backups", []);
        if (backups.length > 0) {
          const latestBackup = backups[backups.length - 1];
          if (latestBackup.data && latestBackup.data[key]) {
            logger.info(`Restoring ${key} from backup ${latestBackup.id}`);
            await this.set(key, latestBackup.data[key]);
            return latestBackup.data[key];
          }
        }
      } catch (backupError) {
        logger.warn("Could not restore from backup:", backupError);
      }

      // Return fallback value
      if (fallbackValue !== null) {
        await this.set(key, fallbackValue);
        return fallbackValue;
      }

      return null;
    } catch (error) {
      logger.error("Recovery failed:", error);
      return fallbackValue;
    }
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
      storageAvailable: this.isStorageAvailable(),
    };

    // Log error
    logger.error(`StorageManager ${operation} error:`, errorInfo);

    // Emit error event
    this.emit(STORAGE_EVENTS.ERROR_OCCURRED, errorInfo);

    // Store error for debugging (with size limit)
    try {
      const errors = this.getSession("storage_errors", []);
      errors.push(errorInfo);

      // Keep only last 50 errors
      if (errors.length > LIMIT_CONSTANTS.ERROR_LOG_LIMIT) {
        errors.splice(0, errors.length - LIMIT_CONSTANTS.ERROR_LOG_LIMIT);
      }

      this.setSession("storage_errors", errors);
    } catch (logError) {
      logger.warn("Failed to log storage error:", logError);
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
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          logger.error("Event listener error:", error);
        }
      });
    }
  }

  /**
   * Sync wrapper methods for backward compatibility
   * These methods provide synchronous interfaces for components that need immediate responses
   */

  /**
   * Synchronous get wrapper - uses localStorage as fallback for immediate access
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Stored value or default
   */
  static getSync(key, defaultValue = null) {
    try {
      const fullKey = this.STORAGE_PREFIX + key;
      let item;

      if (this.storage instanceof Map) {
        item = this.storage.get(fullKey);
      } else {
        item = this.storage?.getItem(fullKey);
      }

      if (!item) return defaultValue;

      try {
        const parsedData = JSON.parse(item);
        // Handle legacy data format
        if (!parsedData.metadata) {
          return parsedData.value || parsedData;
        }
        return parsedData.value;
      } catch (parseError) {
        return defaultValue;
      }
    } catch (error) {
      logger.warn(`Sync get failed for key '${key}':`, error);
      return defaultValue;
    }
  }

  /**
   * Synchronous set wrapper - saves to localStorage immediately, queues DataHandler save
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Storage options
   */
  static setSync(key, value, options = {}) {
    try {
      // Save to localStorage immediately for sync access
      const fullKey = this.STORAGE_PREFIX + key;
      const metadata = {
        timestamp: Date.now(),
        version: this.VERSION,
        type: typeof value,
        compressed: false,
        encrypted: false,
      };

      const finalData = { value, metadata };
      const dataString = JSON.stringify(finalData);

      if (this.storage instanceof Map) {
        this.storage.set(fullKey, dataString);
      } else {
        this.storage?.setItem(fullKey, dataString);
      }

      // Asynchronously save to DataHandler if available
      if (this.dataHandler) {
        this.dataHandler
          .saveData(`storage_${key}`, value, {
            ...options,
            source: "StorageManager_sync",
          })
          .catch((error) => {
            console.warn(
              `[StorageManager] Async DataHandler save failed for key '${key}':`,
              error,
            );
          });
      }

      return true;
    } catch (error) {
      logger.warn(`Sync set failed for key '${key}':`, error);
      return false;
    }
  }

  /**
   * Synchronous remove wrapper
   * @param {string} key - Storage key to remove
   */
  static removeSync(key) {
    try {
      const fullKey = this.STORAGE_PREFIX + key;

      if (this.storage instanceof Map) {
        this.storage.delete(fullKey);
      } else {
        this.storage?.removeItem(fullKey);
      }

      // Asynchronously remove from DataHandler if available
      if (this.dataHandler) {
        this.dataHandler.removeData(`storage_${key}`).catch((error) => {
          console.warn(
            `[StorageManager] Async DataHandler remove failed for key '${key}':`,
            error,
          );
        });
      }

      return true;
    } catch (error) {
      logger.warn(`Sync remove failed for key '${key}':`, error);
      return false;
    }
  }
}

// Initialize when module loads
if (typeof window !== "undefined") {
  StorageManager.init().catch((error) => {
    logger.error(
      "Storage initialization failed, continuing with limited functionality:",
      error,
    );
    // Don't re-throw the error to prevent app initialization failure
  });
}

// Export for ES6 modules
export default StorageManager;
