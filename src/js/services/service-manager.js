/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Service Manager for SimulateAI
 * Manages singleton instances of all services to prevent duplicate initializations
 */

import logger from "../utils/logger.js";
import FirebaseService from "./firebase-service.js";
import { AuthService } from "./auth-service.js";
import appCheckService from "./app-check-service.js";

class ServiceManager {
  constructor() {
    this.services = new Map();
    this.initialized = false;
    this.initializationPromise = null;
  }

  /**
   * Initialize all core services in the correct order
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initializeServices();
    return this.initializationPromise;
  }

  async _initializeServices() {
    try {
      logger.info("🚀 ServiceManager: Initializing core services...");

      // 1. Initialize Firebase Service first (core dependency)
      const firebaseService = new FirebaseService();
      const firebaseInitialized = await firebaseService.initialize();

      if (!firebaseInitialized) {
        throw new Error("Firebase service initialization failed");
      }

      this.services.set("firebase", firebaseService);
      logger.info("✅ ServiceManager: Firebase service initialized");

      // 2. Initialize Auth Service (depends on Firebase)
      const authService = new AuthService(firebaseService);
      const authInitialized = await authService.initialize();

      if (!authInitialized) {
        logger.warn(
          "⚠️ ServiceManager: Auth service initialization failed, continuing...",
        );
      }

      this.services.set("auth", authService);
      logger.info("✅ ServiceManager: Auth service initialized");

      // 3. App Check is already initialized as part of Firebase service
      this.services.set("appCheck", appCheckService);
      logger.info("✅ ServiceManager: App Check service registered");

      this.initialized = true;
      logger.info(
        "🎉 ServiceManager: All core services initialized successfully",
      );
      return true;
    } catch (error) {
      logger.error("❌ ServiceManager: Service initialization failed:", error);
      this.initialized = false;
      this.initializationPromise = null;
      return false;
    }
  }

  /**
   * Get a service instance
   * @param {string} serviceName - Name of the service
   * @returns {object|null} Service instance
   */
  getService(serviceName) {
    if (!this.initialized) {
      logger.warn(
        `⚠️ ServiceManager: Services not initialized yet, cannot get ${serviceName}`,
      );
      return null;
    }

    const service = this.services.get(serviceName);
    if (!service) {
      logger.warn(`⚠️ ServiceManager: Service '${serviceName}' not found`);
    }

    return service;
  }

  /**
   * Get Firebase service
   * @returns {FirebaseService|null}
   */
  getFirebaseService() {
    return this.getService("firebase");
  }

  /**
   * Get Auth service
   * @returns {AuthService|null}
   */
  getAuthService() {
    return this.getService("auth");
  }

  /**
   * Get App Check service
   * @returns {AppCheckService|null}
   */
  getAppCheckService() {
    return this.getService("appCheck");
  }

  /**
   * Check if services are initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Register a custom service
   * @param {string} name - Service name
   * @param {object} service - Service instance
   */
  registerService(name, service) {
    this.services.set(name, service);
    logger.info(`✅ ServiceManager: Custom service '${name}' registered`);
  }

  /**
   * Get all service names
   * @returns {string[]} Array of service names
   */
  getServiceNames() {
    return Array.from(this.services.keys());
  }

  /**
   * Get service status
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      services: this.getServiceNames(),
      serviceCount: this.services.size,
    };
  }
}

// Create singleton instance
const serviceManager = new ServiceManager();

// Export singleton
export default serviceManager;

// Also export for global access
if (typeof window !== "undefined") {
  window.serviceManager = serviceManager;
}
