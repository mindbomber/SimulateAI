/**
 * Infinite Loop Detection and Prevention Utilities
 *
 * This module provides tools for detecting and preventing infinite loops
 * in the SimulateAI application.
 */

import logger from './logger.js';

class InfiniteLoopDetector {
  constructor() {
    this.callCounts = new Map();
    this.callTimestamps = new Map();
    this.isEnabled = true;

    // Constants for thresholds
    this.CALLS_PER_SECOND_THRESHOLD = 50;
    this.MAX_STACK_DEPTH = 100;
    this.MAX_SAME_FUNCTION_IN_STACK = 10;
    this.TIME_WINDOW = 1000;
    this.EMERGENCY_CALLS_THRESHOLD = 100;
    this.EMERGENCY_STACK_THRESHOLD = 200;
    this.EMERGENCY_RECURSION_THRESHOLD = 20;
    this.MAX_INCIDENTS = 50;
    this.TIMER_CLEAR_RANGE = 99999;

    this.thresholds = {
      callsPerSecond: this.CALLS_PER_SECOND_THRESHOLD,
      maxStackDepth: this.MAX_STACK_DEPTH,
      maxSameFunction: this.MAX_SAME_FUNCTION_IN_STACK,
      timeWindow: this.TIME_WINDOW,
    };

    this.emergencyStopExecuted = false;
  }

  /**
   * Track function execution to detect potential loops
   */
  trackExecution(functionName, context = '') {
    if (!this.isEnabled) return;

    const key = `${functionName}${context ? `:${context}` : ''}`;
    const now = Date.now();

    // Initialize tracking for this function
    if (!this.callTimestamps.has(key)) {
      this.callTimestamps.set(key, []);
      this.callCounts.set(key, 0);
    }

    // Get existing timestamps and filter to time window
    const timestamps = this.callTimestamps.get(key);
    const recentCalls = timestamps.filter(
      time => now - time < this.thresholds.timeWindow
    );
    recentCalls.push(now);

    // Update tracking
    this.callTimestamps.set(key, recentCalls);
    this.callCounts.set(key, this.callCounts.get(key) + 1);

    // Check for excessive calls
    if (recentCalls.length > this.thresholds.callsPerSecond) {
      this.handleSuspiciousActivity(key, recentCalls.length, 'EXCESSIVE_CALLS');
    }

    // Check call stack depth
    this.checkCallStackDepth(key);
  }

  /**
   * Check for deep call stacks that might indicate recursion
   */
  checkCallStackDepth(functionName) {
    const { stack } = new Error();
    const lines = stack.split('\n');

    if (lines.length > this.thresholds.maxStackDepth) {
      this.handleSuspiciousActivity(functionName, lines.length, 'DEEP_STACK');
      return true;
    }

    // Check for repetitive patterns in call stack
    const functionPattern = this.analyzeCallStack(lines);
    if (functionPattern.maxRepeats > this.thresholds.maxSameFunction) {
      this.handleSuspiciousActivity(
        functionName,
        functionPattern.maxRepeats,
        'RECURSIVE_PATTERN',
        functionPattern.repeatedFunction
      );
      return true;
    }

    return false;
  }

  /**
   * Analyze call stack for repetitive patterns
   */
  analyzeCallStack(stackLines) {
    const functionNames = stackLines
      .slice(2) // Skip Error and checkCallStackDepth
      .map(line => {
        const match = line.match(/at\s+(\w+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    const nameCount = {};
    let maxRepeats = 0;
    let repeatedFunction = null;

    for (const name of functionNames) {
      nameCount[name] = (nameCount[name] || 0) + 1;
      if (nameCount[name] > maxRepeats) {
        maxRepeats = nameCount[name];
        repeatedFunction = name;
      }
    }

    return { maxRepeats, repeatedFunction, totalDepth: functionNames.length };
  }

  /**
   * Handle detection of suspicious activity
   */
  handleSuspiciousActivity(functionName, count, type, details = '') {
    const message = this.formatWarningMessage(
      functionName,
      count,
      type,
      details
    );

    logger.warn('InfiniteLoopDetector', `🚨 POTENTIAL LOOP: ${message}`);

    // Record the incident
    this.recordIncident(functionName, count, type, details);

    // Auto-execute emergency stop for severe cases
    if (this.shouldExecuteEmergencyStop(count, type)) {
      this.executeEmergencyStop(`Auto-triggered by ${type}`);
    }
  }

  /**
   * Format warning message based on detection type
   */
  formatWarningMessage(functionName, count, type, details) {
    switch (type) {
      case 'EXCESSIVE_CALLS':
        return `${functionName} called ${count} times in ${this.thresholds.timeWindow}ms`;
      case 'DEEP_STACK':
        return `Deep call stack detected: ${count} levels in ${functionName}`;
      case 'RECURSIVE_PATTERN':
        return `Recursive pattern: ${details} appears ${count} times in stack (from ${functionName})`;
      default:
        return `Suspicious activity in ${functionName}: ${count} (${type})`;
    }
  }

  /**
   * Determine if emergency stop should be executed
   */
  shouldExecuteEmergencyStop(count, type) {
    if (this.emergencyStopExecuted) return false;

    return (
      (type === 'EXCESSIVE_CALLS' && count > this.EMERGENCY_CALLS_THRESHOLD) ||
      (type === 'DEEP_STACK' && count > this.EMERGENCY_STACK_THRESHOLD) ||
      (type === 'RECURSIVE_PATTERN' &&
        count > this.EMERGENCY_RECURSION_THRESHOLD)
    );
  }

  /**
   * Record incident for analysis
   */
  recordIncident(functionName, count, type, details) {
    if (!window.loopIncidents) {
      window.loopIncidents = [];
    }

    window.loopIncidents.push({
      timestamp: new Date().toISOString(),
      functionName,
      count,
      type,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Keep only last MAX_INCIDENTS incidents
    if (window.loopIncidents.length > this.MAX_INCIDENTS) {
      window.loopIncidents = window.loopIncidents.slice(-this.MAX_INCIDENTS);
    }
  }

  /**
   * Execute emergency stop to halt runaway processes
   */
  executeEmergencyStop(reason = 'Manual trigger') {
    if (this.emergencyStopExecuted) {
      logger.info('InfiniteLoopDetector', '🛑 Emergency stop already executed');
      return;
    }

    this.emergencyStopExecuted = true;
    logger.warn(
      'InfiniteLoopDetector',
      `🛑 EXECUTING EMERGENCY STOP: ${reason}`
    );

    // Clear all timeouts and intervals
    this.clearAllTimers();

    // Disconnect observers
    this.disconnectObservers();

    // Stop animations
    this.stopAnimations();

    // Disable this detector to prevent it from triggering more warnings
    this.isEnabled = false;

    logger.info('InfiniteLoopDetector', '🛑 Emergency stop completed');
  }

  /**
   * Clear all timers (timeouts and intervals)
   */
  clearAllTimers() {
    try {
      // Clear timeouts and intervals (brute force approach)
      for (let i = 1; i < this.TIMER_CLEAR_RANGE; i++) {
        window.clearTimeout(i);
        window.clearInterval(i);
      }
      logger.info('InfiniteLoopDetector', '✅ All timers cleared');
    } catch (error) {
      logger.error('InfiniteLoopDetector', '❌ Error clearing timers', error);
    }
  }

  /**
   * Disconnect known observers
   */
  disconnectObservers() {
    try {
      // Disconnect onboarding tour observer
      if (window.app?.onboardingTour?.contentObserver) {
        window.app.onboardingTour.contentObserver.disconnect();
        logger.info(
          'InfiniteLoopDetector',
          '✅ Onboarding content observer disconnected'
        );
      }

      // Disconnect any mutation observers
      if (window.activeMutationObservers) {
        window.activeMutationObservers.forEach(observer =>
          observer.disconnect()
        );
        logger.info(
          'InfiniteLoopDetector',
          '✅ Active mutation observers disconnected'
        );
      }
    } catch (error) {
      logger.error(
        'InfiniteLoopDetector',
        '❌ Error disconnecting observers',
        error
      );
    }
  }

  /**
   * Stop animations
   */
  stopAnimations() {
    try {
      // Cancel animation frames
      if (window.activeAnimationFrames) {
        window.activeAnimationFrames.forEach(id => cancelAnimationFrame(id));
        logger.info('InfiniteLoopDetector', '✅ Animation frames cancelled');
      }

      // Stop CSS animations
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        el.style.animationPlayState = 'paused';
        el.style.transitionDuration = '0s';
      });
      logger.info('InfiniteLoopDetector', '✅ CSS animations paused');
    } catch (error) {
      logger.error(
        'InfiniteLoopDetector',
        '❌ Error stopping animations',
        error
      );
    }
  }

  /**
   * Get detection statistics
   */
  getStats() {
    const stats = {
      totalFunctions: this.callCounts.size,
      isEnabled: this.isEnabled,
      emergencyStopExecuted: this.emergencyStopExecuted,
      topCallers: [],
      incidents: window.loopIncidents || [],
    };

    // Get top callers
    const sortedCalls = Array.from(this.callCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    stats.topCallers = sortedCalls.map(([name, count]) => {
      const timestamps = this.callTimestamps.get(name) || [];
      const recentCount = timestamps.filter(
        t => Date.now() - t < this.thresholds.timeWindow
      ).length;
      return { name, totalCalls: count, recentCalls: recentCount };
    });

    return stats;
  }

  /**
   * Reset all tracking data
   */
  reset() {
    this.callCounts.clear();
    this.callTimestamps.clear();
    this.emergencyStopExecuted = false;
    this.isEnabled = true;
    logger.info('InfiniteLoopDetector', '🔄 Loop detector reset');
  }

  /**
   * Enable/disable the detector
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    logger.info(
      'InfiniteLoopDetector',
      `🔧 Loop detector ${enabled ? 'enabled' : 'disabled'}`
    );
  }
}

// Global instance
const loopDetector = new InfiniteLoopDetector();

// Export for use in modules
export { InfiniteLoopDetector, loopDetector };

// Add to window for debugging (always available in browser)
if (typeof window !== 'undefined') {
  window.loopDetector = loopDetector;

  // Add convenient debugging functions
  window.debugUtils = {
    // Track a specific function
    trackFunction: (obj, methodName) => {
      if (!obj[methodName]) {
        logger.error('DebugUtils', `Method ${methodName} not found on object`);
        return;
      }

      const original = obj[methodName];
      obj[methodName] = function (...args) {
        loopDetector.trackExecution(`${obj.constructor.name}.${methodName}`);
        return original.apply(this, args);
      };

      logger.info(
        'DebugUtils',
        `Now tracking ${obj.constructor.name}.${methodName}`
      );
    },

    // Stop tracking a function
    stopTracking: (obj, methodName, originalMethod) => {
      if (originalMethod) {
        obj[methodName] = originalMethod;
        logger.info(
          'DebugUtils',
          `Stopped tracking ${obj.constructor.name}.${methodName}`
        );
      }
    },

    // Get current stats
    getStats: () => loopDetector.getStats(),

    // Manual emergency stop
    emergencyStop: reason => loopDetector.executeEmergencyStop(reason),

    // Reset detector
    reset: () => loopDetector.reset(),

    // Enable/disable
    setEnabled: enabled => loopDetector.setEnabled(enabled),
  };

  logger.info(
    'DebugUtils',
    'Debug utilities loaded. Use window.debugUtils for manual controls.'
  );
}
