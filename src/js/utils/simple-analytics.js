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
 * Simplified Analytics Manager - Educational Focus
 * Provides basic analytics without complex storage dependencies
 *
 * @version 1.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import { simpleStorage, userPreferences } from './simple-storage.js';
import logger from './logger.js';

/**
 * Simple analytics manager for educational platforms
 */
class SimpleAnalyticsManager {
  constructor() {
    this.enabled = true;
    this.events = [];
    this.maxEvents = 100;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    logger.info('📊 Simple Analytics Manager initialized');
  }

  /**
   * Generate a simple session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled() {
    try {
      const prefs = userPreferences.getAllPreferences();
      return prefs.analytics !== false && this.enabled;
    } catch (error) {
      return this.enabled;
    }
  }

  /**
   * Track a simple event
   */
  trackEvent(eventName, data = {}) {
    if (!this.isEnabled()) return;

    try {
      const event = {
        name: eventName,
        data,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        url: window.location.href,
      };

      this.events.push(event);

      // Keep only recent events
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
      }

      logger.info('📊 Event tracked:', eventName, data);
    } catch (error) {
      logger.warn('Error tracking event:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page = window.location.pathname) {
    this.trackEvent('page_view', { page });
  }

  /**
   * Track simulation start
   */
  trackSimulationStart(simulationId, metadata = {}) {
    this.trackEvent('simulation_start', {
      simulationId,
      ...metadata,
    });
  }

  /**
   * Track simulation completion
   */
  trackSimulationComplete(simulationId, results = {}) {
    this.trackEvent('simulation_complete', {
      simulationId,
      score: results.score || 0,
      timeSpent: results.timeSpent || 0,
      scenarios: results.scenarios || [],
      ...results,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(type, target, details = {}) {
    this.trackEvent('user_interaction', {
      type,
      target,
      ...details,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric, value, details = {}) {
    this.trackEvent('performance', {
      metric,
      value,
      ...details,
    });
  }

  /**
   * Track accessibility usage
   */
  trackAccessibility(feature, enabled, details = {}) {
    this.trackEvent('accessibility', {
      feature,
      enabled,
      ...details,
    });
  }

  /**
   * Track error
   */
  trackError(error, context = {}) {
    this.trackEvent('error', {
      message: error.message || String(error),
      stack: error.stack || 'No stack trace',
      ...context,
    });
  }

  /**
   * Get session summary
   */
  getSessionSummary() {
    const sessionEvents = this.events.filter(
      e => e.sessionId === this.sessionId
    );
    const duration = Date.now() - this.startTime;

    return {
      sessionId: this.sessionId,
      duration,
      eventCount: sessionEvents.length,
      events: sessionEvents,
      startTime: this.startTime,
      endTime: Date.now(),
    };
  }

  /**
   * Get all events (for debugging)
   */
  getAllEvents() {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clearEvents() {
    this.events = [];
    logger.info('📊 Analytics events cleared');
  }

  /**
   * Save events to storage (simple)
   */
  saveEvents() {
    try {
      const summary = this.getSessionSummary();
      simpleStorage.set('analytics_session', summary);
      simpleStorage.set('analytics_events', this.events);
    } catch (error) {
      logger.warn('Error saving analytics events:', error);
    }
  }

  /**
   * Load events from storage
   */
  loadEvents() {
    try {
      const savedEvents = simpleStorage.get('analytics_events', []);
      const savedSession = simpleStorage.get('analytics_session', null);

      if (savedEvents.length > 0) {
        this.events = savedEvents;
        logger.info('📊 Loaded', savedEvents.length, 'analytics events');
      }

      if (savedSession) {
        logger.info('📊 Previous session:', savedSession);
      }
    } catch (error) {
      logger.warn('Error loading analytics events:', error);
    }
  }

  /**
   * Initialize analytics system
   */
  async init() {
    try {
      this.loadEvents();
      this.trackPageView();

      // Auto-save events periodically
      setInterval(() => {
        this.saveEvents();
      }, 30000); // Every 30 seconds

      // Save events when page unloads
      window.addEventListener('beforeunload', () => {
        this.saveEvents();
      });

      logger.info('📊 Simple Analytics Manager ready');
    } catch (error) {
      logger.warn('Error initializing analytics:', error);
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info('📊 Analytics', enabled ? 'enabled' : 'disabled');

    // Save preference
    try {
      const prefs = userPreferences.getAllPreferences();
      prefs.analytics = enabled;
      // Note: We're not saving this back as it would require updating the preference structure
    } catch (error) {
      logger.warn('Error saving analytics preference:', error);
    }
  }
}

// Create singleton instance
const simpleAnalytics = new SimpleAnalyticsManager();

// Export for use in other modules
export { SimpleAnalyticsManager, simpleAnalytics };

// Make available globally for compatibility and debugging
window.AnalyticsManager = simpleAnalytics;
window.SimpleAnalytics = simpleAnalytics;

// Auto-initialize
simpleAnalytics.init();

logger.info('✅ Simple Analytics Manager loaded');
