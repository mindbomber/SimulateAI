/**
 * Logger Utility
 * Provides structured logging with different levels and environments
 */
/* eslint-disable no-console */

class Logger {
  constructor() {
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    };

    // Set log level based on environment
    this.currentLevel = this.detectEnvironment();
    this.enabledTypes = new Set(['error', 'warn', 'info']);

    // Production mode disables most logging
    if (this.isProduction()) {
      this.enabledTypes = new Set(['error']);
    }
  }

  /**
   * Detect current environment
   */
  detectEnvironment() {
    // Check for common development indicators
    if (typeof window !== 'undefined') {
      const isDev =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('dev') ||
        window.location.search.includes('debug=true');
      return isDev ? this.levels.DEBUG : this.levels.WARN;
    }
    return this.levels.WARN;
  }

  /**
   * Check if running in production
   */
  isProduction() {
    return (
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1' &&
      !window.location.hostname.includes('dev')
    );
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, context, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const contextStr = context ? ` [${context}]` : '';

    if (data !== undefined) {
      return [prefix + contextStr, message, data];
    }
    return [prefix + contextStr, message];
  }

  /**
   * Core logging method
   */
  log(level, context, message, data) {
    if (!this.enabledTypes.has(level)) {
      return;
    }

    const args = this.formatMessage(level, context, message, data);

    try {
      switch (level) {
        case 'error':
          console.error(...args);
          break;
        case 'warn':
          console.warn(...args);
          break;
        case 'info':
          console.info(...args);
          break;
        case 'debug':
          console.log(...args);
          break;
        case 'trace':
          console.trace(...args);
          break;
        default:
          console.log(...args);
      }
    } catch (e) {
      // Fallback for environments without console methods
      try {
        console.log(...args);
      } catch (fallbackError) {
        // Silent fail in restrictive environments
      }
    }
  }

  /**
   * Error logging - always enabled
   */
  error(context, message, data) {
    this.log('error', context, message, data);
  }

  /**
   * Warning logging - enabled in dev and staging
   */
  warn(context, message, data) {
    this.log('warn', context, message, data);
  }

  /**
   * Info logging - enabled in development
   */
  info(context, message, data) {
    this.log('info', context, message, data);
  }

  /**
   * Debug logging - enabled in development with debug flag
   */
  debug(context, message, data) {
    this.log('debug', context, message, data);
  }

  /**
   * Trace logging - enabled in development with debug flag
   */
  trace(context, message, data) {
    this.log('trace', context, message, data);
  }

  /**
   * Performance timing
   */
  time(label) {
    if (this.enabledTypes.has('debug')) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.enabledTypes.has('debug')) {
      console.timeEnd(label);
    }
  }

  /**
   * Enable/disable specific log types
   */
  enable(type) {
    this.enabledTypes.add(type);
  }

  disable(type) {
    this.enabledTypes.delete(type);
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.enabledTypes.add('debug');
    this.enabledTypes.add('trace');
  }

  /**
   * Disable all logging except errors
   */
  silent() {
    this.enabledTypes.clear();
    this.enabledTypes.add('error');
  }
}

// Create singleton instance
const logger = new Logger();

// ES6 module exports
export default logger;
export { logger };

// Backward compatibility for older modules
if (typeof window !== 'undefined') {
  window.Logger = logger;
}
