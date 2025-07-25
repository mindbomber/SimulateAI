/**
 * Enhanced App Integration Module
 * Coordinates DataHandler and UIBinder integration with existing components
 *
 * This module provides the bridge between the new centralized systems
 * and the existing component architecture.
 */

// Import dependencies (will be loaded globally)
// DataHandler and UIBinder are expected to be available globally

class EnhancedApp {
  constructor() {
    this.dataHandler = null;
    this.uiBinder = null;
    this.components = new Map();
    this.isInitialized = false;
    this.initializationPromise = null;

    // Migration tracking
    this.migrationStatus = {
      settingsManager: false,
      donationPreferences: false,
      mainGrid: false,
      simulationEngine: false,
      userEngagementTracker: false,
      unifiedAnimationManager: false, // Phase 2.3
    };

    console.log("[EnhancedApp] Instance created");
  }

  /**
   * Initialize the enhanced app with all systems
   */
  async init() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInit();
    return this.initializationPromise;
  }

  async _performInit() {
    if (this.isInitialized) return;

    try {
      console.log("[EnhancedApp] Starting initialization...");

      // Initialize DataHandler
      await this.initializeDataHandler();

      // Initialize UIBinder
      await this.initializeUIBinder();

      // Initialize enhanced components
      await this.initializeEnhancedComponents();

      // Set up inter-component communication
      this.setupComponentCommunication();

      // Perform health checks
      await this.performHealthChecks();

      this.isInitialized = true;
      console.log("[EnhancedApp] Initialization complete!");

      // Emit initialization complete event
      this.emit("initialized", {
        dataHandler: !!this.dataHandler,
        uiBinder: !!this.uiBinder,
        componentsCount: this.components.size,
      });
    } catch (error) {
      console.error("[EnhancedApp] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Initialize DataHandler with Firebase integration
   */
  async initializeDataHandler() {
    try {
      // Get Firebase service if available
      const firebaseService = window.firebaseService || null;

      // Create DataHandler instance (assuming it's globally available)
      this.dataHandler = new window.DataHandler(firebaseService);

      // Test basic functionality
      const healthCheck = await this.dataHandler.healthCheck();
      console.log("[EnhancedApp] DataHandler initialized:", healthCheck.status);
    } catch (error) {
      console.error("[EnhancedApp] DataHandler initialization failed:", error);
      // Create fallback DataHandler without Firebase
      this.dataHandler = new window.DataHandler();
    }
  }

  /**
   * Initialize UIBinder with DataHandler integration
   */
  async initializeUIBinder() {
    try {
      this.uiBinder = new window.UIBinder(this.dataHandler);
      await this.uiBinder.init();

      const healthCheck = this.uiBinder.healthCheck();
      console.log("[EnhancedApp] UIBinder initialized:", healthCheck.status);
    } catch (error) {
      console.error("[EnhancedApp] UIBinder initialization failed:", error);
      // Create fallback UIBinder
      this.uiBinder = new window.UIBinder();
      await this.uiBinder.init();
    }
  }

  /**
   * Initialize enhanced components with migration
   */
  async initializeEnhancedComponents() {
    const componentInitializers = [
      {
        name: "settingsManager",
        initializer: this.initializeSettingsManager.bind(this),
      },
      {
        name: "donationPreferences",
        initializer: this.initializeDonationPreferences.bind(this),
      },
      { name: "mainGrid", initializer: this.initializeMainGrid.bind(this) },
      {
        name: "simulationEngine",
        initializer: this.initializeSimulationEngine.bind(this),
      },
      {
        name: "userEngagementTracker",
        initializer: this.initializeUserEngagementTracker.bind(this),
      },
      {
        name: "unifiedAnimationManager", // Phase 2.3
        initializer: this.initializeUnifiedAnimationManager.bind(this),
      },
      {
        name: "storageManager", // Phase 2.4
        initializer: this.initializeStorageManager.bind(this),
      },
    ];

    for (const { name, initializer } of componentInitializers) {
      try {
        await initializer();
        this.migrationStatus[name] = true;
        console.log(`[EnhancedApp] ${name} enhanced successfully`);
      } catch (error) {
        console.error(`[EnhancedApp] Failed to enhance ${name}:`, error);
        this.migrationStatus[name] = false;
      }
    }
  }

  /**
   * Enhanced SettingsManager integration
   */
  async initializeSettingsManager() {
    if (!window.SettingsManager) {
      console.warn(
        "[EnhancedApp] SettingsManager not found, skipping enhancement",
      );
      return;
    }

    // Create enhanced instance
    const settingsManager = new window.SettingsManager(this);

    // Store reference
    this.components.set("settingsManager", settingsManager);

    // Make globally available for backward compatibility
    window.settingsManager = settingsManager;

    // Initialize with DataHandler
    await settingsManager.loadStoredSettings();

    console.log("[EnhancedApp] SettingsManager enhanced with DataHandler");
  }

  /**
   * Enhanced DonationPreferences integration
   */
  async initializeDonationPreferences() {
    if (!window.DonationPreferences) {
      console.warn(
        "[EnhancedApp] DonationPreferences not found, skipping enhancement",
      );
      return;
    }

    // Create enhanced instance
    const donationPreferences = new window.DonationPreferences(this);

    // Store reference
    this.components.set("donationPreferences", donationPreferences);

    // Make globally available for backward compatibility
    window.donationPreferences = donationPreferences;

    // Initialize with DataHandler
    await donationPreferences.loadUserPreferences();

    console.log("[EnhancedApp] DonationPreferences enhanced with DataHandler");
  }

  /**
   * Enhanced MainGrid integration
   */
  async initializeMainGrid() {
    if (!window.MainGrid) {
      console.warn("[EnhancedApp] MainGrid not found, skipping enhancement");
      return;
    }

    // Create enhanced instance
    const mainGrid = new window.MainGrid(this);

    // Store reference
    this.components.set("mainGrid", mainGrid);

    // Make globally available for backward compatibility
    window.mainGrid = mainGrid;

    // Initialize with async pattern
    await mainGrid.init();

    console.log("[EnhancedApp] MainGrid enhanced with DataHandler");
  }

  /**
   * Enhanced SimulationEngine integration
   */
  async initializeSimulationEngine() {
    if (!window.SimulationEngine) {
      console.warn(
        "[EnhancedApp] SimulationEngine not found, skipping enhancement",
      );
      return;
    }

    // Check if there's an existing simulation engine instance that needs migration
    const existingSimulationEngine = window.simulationEngine;

    if (existingSimulationEngine) {
      // Migrate existing settings if available
      let existingSettings = null;
      try {
        if (typeof existingSimulationEngine.loadSettings === "function") {
          existingSettings = await existingSimulationEngine.loadSettings();
        }
      } catch (error) {
        console.warn(
          "[EnhancedApp] Could not load existing SimulationEngine settings:",
          error,
        );
      }

      // If we have existing settings, save them to DataHandler
      if (existingSettings) {
        try {
          await this.dataHandler.saveSettings(
            "simulationEngine",
            existingSettings,
          );
          console.log(
            "[EnhancedApp] Migrated existing SimulationEngine settings to DataHandler",
          );
        } catch (error) {
          console.warn(
            "[EnhancedApp] Could not migrate SimulationEngine settings:",
            error,
          );
        }
      }
    }

    // Create enhanced instance - note: containerId and config will be set when actually instantiated
    // For now, we just ensure the class is enhanced and available
    this.components.set("simulationEngine", "ready_for_instantiation");

    console.log(
      "[EnhancedApp] SimulationEngine enhanced and ready for DataHandler integration",
    );
  }

  /**
   * Enhanced UserEngagementTracker integration
   */
  async initializeUserEngagementTracker() {
    if (!window.UserEngagementTracker) {
      console.warn(
        "[EnhancedApp] UserEngagementTracker not found, skipping enhancement",
      );
      return;
    }

    // Check if there's an existing userEngagementTracker instance
    const existingTracker = window.userEngagementTracker;

    if (existingTracker) {
      // Migrate existing data if available
      let existingData = null;
      try {
        existingData = {
          userProfile: existingTracker.userProfile || {},
          engagementMetrics: existingTracker.engagementMetrics || {},
          behaviorPatterns: existingTracker.behaviorPatterns || {},
          settingsUsage: existingTracker.settingsUsage || {},
        };
      } catch (error) {
        console.warn(
          "[EnhancedApp] Could not access existing UserEngagementTracker data:",
          error,
        );
      }

      // If we have existing data, save it to DataHandler
      if (existingData && Object.keys(existingData.userProfile).length > 0) {
        try {
          await this.dataHandler.saveSettings(
            "userEngagementTracker_userProfile",
            existingData.userProfile,
          );
          await this.dataHandler.saveSettings(
            "userEngagementTracker_engagementMetrics",
            existingData.engagementMetrics,
          );
          await this.dataHandler.saveSettings(
            "userEngagementTracker_behaviorPatterns",
            existingData.behaviorPatterns,
          );
          await this.dataHandler.saveSettings(
            "userEngagementTracker_settingsUsage",
            existingData.settingsUsage,
          );
          console.log(
            "[EnhancedApp] Migrated existing UserEngagementTracker data to DataHandler",
          );
        } catch (error) {
          console.warn(
            "[EnhancedApp] Could not migrate UserEngagementTracker data:",
            error,
          );
        }
      }
    }

    // Create enhanced instance
    const enhancedTracker = new window.UserEngagementTracker(this);

    // Initialize async data loading
    await enhancedTracker.initializeAsync();

    // Store reference
    this.components.set("userEngagementTracker", enhancedTracker);

    // Update global reference to enhanced instance
    window.userEngagementTracker = enhancedTracker;

    console.log(
      "[EnhancedApp] UserEngagementTracker enhanced with DataHandler integration",
    );
  }

  /**
   * Enhanced UnifiedAnimationManager integration
   * Phase 2.3: Animation state persistence and coordination
   */
  async initializeUnifiedAnimationManager() {
    if (!window.UnifiedAnimationManager) {
      console.warn(
        "[EnhancedApp] UnifiedAnimationManager not found, skipping enhancement",
      );
      return;
    }

    // Check if there's an existing animation manager instance that needs migration
    const existingAnimationManager = window.animationManager;

    if (existingAnimationManager) {
      // Migrate existing settings if available
      let existingSettings = null;
      try {
        if (typeof existingAnimationManager.loadSettings === "function") {
          existingSettings = existingAnimationManager.loadSettings();
        }
      } catch (error) {
        console.warn(
          "[EnhancedApp] Failed to load existing animation settings:",
          error,
        );
      }

      // Create enhanced instance with app integration
      const enhancedAnimationManager = new window.UnifiedAnimationManager(
        existingAnimationManager.engine || null,
        this,
      );

      // Migrate settings to DataHandler
      if (existingSettings && Object.keys(existingSettings).length > 0) {
        try {
          await enhancedAnimationManager.saveAnimationSettings(
            existingSettings,
          );
          console.log(
            "[EnhancedApp] Migrated existing animation settings to DataHandler",
          );
        } catch (error) {
          console.warn(
            "[EnhancedApp] Failed to migrate animation settings:",
            error,
          );
        }
      }

      // Migrate animation state if available
      try {
        if (
          existingAnimationManager.activeAnimations ||
          existingAnimationManager.timelines
        ) {
          const animationState = {
            activeAnimations: Array.from(
              existingAnimationManager.activeAnimations || [],
            ),
            timelines: Array.from(
              existingAnimationManager.timelines?.keys() || [],
            ),
            performanceMetrics:
              existingAnimationManager.performanceMonitor?.getMetrics() || {},
          };

          await enhancedAnimationManager.saveAnimationState(animationState);
          console.log(
            "[EnhancedApp] Migrated existing animation state to DataHandler",
          );
        }
      } catch (error) {
        console.warn("[EnhancedApp] Failed to migrate animation state:", error);
      }

      // Store reference
      this.components.set("unifiedAnimationManager", enhancedAnimationManager);

      // Update global reference to enhanced instance
      window.animationManager = enhancedAnimationManager;

      // Also make available as UnifiedAnimationManager global
      window.unifiedAnimationManager = enhancedAnimationManager;
    } else {
      // Create new enhanced instance
      const enhancedAnimationManager = new window.UnifiedAnimationManager(
        null,
        this,
      );

      // Initialize async data loading
      try {
        await enhancedAnimationManager.loadAnimationSettings();
        await enhancedAnimationManager.loadAnimationState();
      } catch (error) {
        console.warn("[EnhancedApp] Failed to load animation data:", error);
      }

      // Store reference
      this.components.set("unifiedAnimationManager", enhancedAnimationManager);

      // Make globally available
      window.animationManager = enhancedAnimationManager;
      window.unifiedAnimationManager = enhancedAnimationManager;
    }

    console.log(
      "[EnhancedApp] UnifiedAnimationManager enhanced with DataHandler integration",
    );
  }

  /**
   * Enhanced StorageManager integration
   * Phase 2.4: Storage architecture bridge and DataHandler compatibility
   */
  async initializeStorageManager() {
    if (!window.StorageManager) {
      console.warn(
        "[EnhancedApp] StorageManager not found, skipping enhancement",
      );
      return;
    }

    try {
      // Initialize StorageManager with DataHandler integration
      await window.StorageManager.initialize(this);

      // Migrate existing localStorage data to DataHandler if needed
      await this.migrateStorageData();

      // Store reference for component communication
      this.components.set("storageManager", window.StorageManager);

      console.log(
        "[EnhancedApp] StorageManager enhanced with DataHandler integration",
      );
    } catch (error) {
      console.error(
        "[EnhancedApp] StorageManager initialization failed:",
        error,
      );
      // Fall back to basic initialization
      try {
        await window.StorageManager.init();
        console.log(
          "[EnhancedApp] StorageManager initialized in standalone mode",
        );
      } catch (fallbackError) {
        console.error(
          "[EnhancedApp] StorageManager fallback initialization failed:",
          fallbackError,
        );
      }
    }
  }

  /**
   * Migrate existing storage data to DataHandler
   */
  async migrateStorageData() {
    if (!this.dataHandler) {
      console.log(
        "[EnhancedApp] No DataHandler available for storage migration",
      );
      return;
    }

    try {
      const migrationKeys = [
        "user_preferences",
        "user_progress",
        "simulation_settings",
        "analytics_data",
        "system_backups",
        "decisions",
      ];

      let migratedCount = 0;

      for (const key of migrationKeys) {
        try {
          // Check if data exists in localStorage but not in DataHandler
          const localData = window.StorageManager.getSync(key);
          if (localData && localData !== null) {
            const existingData = await this.dataHandler.getData(
              `storage_${key}`,
            );
            if (!existingData) {
              // Migrate to DataHandler
              await this.dataHandler.saveData(`storage_${key}`, localData, {
                source: "StorageManager_migration",
              });
              migratedCount++;
              console.log(
                `[EnhancedApp] Migrated storage data for key: ${key}`,
              );
            }
          }
        } catch (keyError) {
          console.warn(
            `[EnhancedApp] Failed to migrate storage key '${key}':`,
            keyError,
          );
        }
      }

      if (migratedCount > 0) {
        console.log(
          `[EnhancedApp] Successfully migrated ${migratedCount} storage keys to DataHandler`,
        );
      } else {
        console.log("[EnhancedApp] No storage data required migration");
      }
    } catch (error) {
      console.error("[EnhancedApp] Storage migration failed:", error);
    }
  }

  /**
   * Set up component communication
   */
  setupComponentCommunication() {
    // Settings changes should update UI
    this.on("settingsChanged", async (event) => {
      const { settings } = event.detail;

      // Apply theme if changed
      if (settings.theme && this.uiBinder) {
        await this.uiBinder.applyTheme(settings.theme);
      }

      // Notify other components
      this.components.forEach((component) => {
        if (typeof component.onSettingsChanged === "function") {
          component.onSettingsChanged(settings);
        }
      });
    });

    // Progress updates should sync across components
    this.on("progressChanged", async (event) => {
      const { progress } = event.detail;

      // Update progress in all relevant components
      this.components.forEach((component) => {
        if (typeof component.onProgressChanged === "function") {
          component.onProgressChanged(progress);
        }
      });
    });

    // Theme changes should be applied globally
    this.on("themeChanged", (event) => {
      const { theme } = event.detail;

      // Notify components of theme change
      this.components.forEach((component) => {
        if (typeof component.onThemeChanged === "function") {
          component.onThemeChanged(theme);
        }
      });
    });

    console.log("[EnhancedApp] Component communication established");
  }

  /**
   * Perform system health checks
   */
  async performHealthChecks() {
    const health = {
      timestamp: new Date().toISOString(),
      dataHandler: null,
      uiBinder: null,
      components: {},
      overall: "healthy",
    };

    // Check DataHandler
    if (this.dataHandler) {
      health.dataHandler = await this.dataHandler.healthCheck();
    }

    // Check UIBinder
    if (this.uiBinder) {
      health.uiBinder = this.uiBinder.healthCheck();
    }

    // Check components
    this.components.forEach((component, name) => {
      health.components[name] = {
        loaded: !!component,
        migrated: this.migrationStatus[name] || false,
        hasHealthCheck: typeof component.healthCheck === "function",
      };

      if (health.components[name].hasHealthCheck) {
        try {
          health.components[name].health = component.healthCheck();
        } catch (error) {
          health.components[name].health = {
            status: "error",
            error: error.message,
          };
        }
      }
    });

    // Determine overall health
    const criticalIssues = [];
    if (health.dataHandler?.status === "critical")
      criticalIssues.push("DataHandler critical");
    if (health.uiBinder?.status === "critical")
      criticalIssues.push("UIBinder critical");

    if (criticalIssues.length > 0) {
      health.overall = "critical";
      health.issues = criticalIssues;
    } else if (
      health.dataHandler?.status === "degraded" ||
      health.uiBinder?.status === "degraded"
    ) {
      health.overall = "degraded";
    }

    console.log("[EnhancedApp] Health check completed:", health.overall);
    return health;
  }

  /**
   * Migration utilities
   */
  getMigrationStatus() {
    return {
      ...this.migrationStatus,
      summary: {
        total: Object.keys(this.migrationStatus).length,
        completed: Object.values(this.migrationStatus).filter(Boolean).length,
        remaining: Object.values(this.migrationStatus).filter(
          (status) => !status,
        ).length,
      },
    };
  }

  async migratePendingComponents() {
    const pending = Object.entries(this.migrationStatus)
      .filter(([, status]) => !status)
      .map(([name]) => name);

    console.log(
      `[EnhancedApp] Migrating ${pending.length} pending components:`,
      pending,
    );

    for (const componentName of pending) {
      try {
        switch (componentName) {
          case "simulationEngine":
            await this.migrateSimulationEngine();
            break;
          case "userEngagementTracker":
            await this.migrateUserEngagementTracker();
            break;
          // Add more components as needed
        }
      } catch (error) {
        console.error(
          `[EnhancedApp] Failed to migrate ${componentName}:`,
          error,
        );
      }
    }

    return this.getMigrationStatus();
  }

  /**
   * Future component migrations
   */
  async migrateSimulationEngine() {
    // Placeholder for Phase 2 migration
    console.log("[EnhancedApp] SimulationEngine migration pending...");
    this.migrationStatus.simulationEngine = false;
  }

  async migrateUserEngagementTracker() {
    // Placeholder for Phase 2 migration
    console.log("[EnhancedApp] UserEngagementTracker migration pending...");
    this.migrationStatus.userEngagementTracker = false;
  }

  /**
   * API access methods
   */
  getDataHandler() {
    return this.dataHandler;
  }

  getUIBinder() {
    return this.uiBinder;
  }

  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Event system
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(`enhancedapp:${eventName}`, { detail: data });
    document.dispatchEvent(event);
  }

  on(eventName, handler) {
    document.addEventListener(`enhancedapp:${eventName}`, handler);
  }

  off(eventName, handler) {
    document.removeEventListener(`enhancedapp:${eventName}`, handler);
  }

  /**
   * Cleanup
   */
  async destroy() {
    // Cleanup components
    this.components.forEach((component) => {
      if (typeof component.destroy === "function") {
        component.destroy();
      }
    });
    this.components.clear();

    // Cleanup systems
    if (this.uiBinder && typeof this.uiBinder.destroy === "function") {
      this.uiBinder.destroy();
    }

    if (this.dataHandler && typeof this.dataHandler.destroy === "function") {
      this.dataHandler.destroy();
    }

    this.isInitialized = false;
    console.log("[EnhancedApp] Cleanup completed");
  }
}

// Create global instance
window.enhancedApp = new EnhancedApp();

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.enhancedApp.init().catch(console.error);
  });
} else {
  // DOM already ready
  setTimeout(() => {
    window.enhancedApp.init().catch(console.error);
  }, 100);
}

// Export for modules
export default EnhancedApp;
