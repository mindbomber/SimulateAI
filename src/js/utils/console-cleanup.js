/**
 * Console Cleanup Utility
 * Provides users with easy controls to reduce console log noise
 */

class ConsoleCleanup {
  constructor() {
    this.isInitialized = false;
    this.originalMethods = {};
    this.logCounts = {
      info: 0,
      warn: 0,
      error: 0,
      debug: 0,
    };
    this.filteredMessages = new Set([
      "Configuration loaded successfully",
      "Enterprise monitoring initialized",
      "Component preloaded",
      "Health check performed",
      "Telemetry batch flushed",
      "Event tracked",
    ]);
  }

  /**
   * Initialize console cleanup
   */
  init() {
    if (this.isInitialized) return;

    // Store original console methods
    this.originalMethods = {
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
      log: console.log.bind(console),
    };

    this.isInitialized = true;
    console.log(
      "🧹 Console Cleanup initialized. Use window.consoleCleanup.enableQuietMode() to reduce noise.",
    );
  }

  /**
   * Enable quiet mode - reduces console noise significantly
   */
  enableQuietMode() {
    localStorage.setItem("quiet-logs", "true");

    // Override console methods to filter noise
    console.info = (...args) => {
      if (!this._shouldFilterMessage(args[0])) {
        this.logCounts.info++;
        this.originalMethods.info(...args);
      }
    };

    console.warn = (...args) => {
      this.logCounts.warn++;
      this.originalMethods.warn(...args);
    };

    console.error = (...args) => {
      this.logCounts.error++;
      this.originalMethods.error(...args);
    };

    console.log = (...args) => {
      if (!this._shouldFilterMessage(args[0])) {
        this.originalMethods.log(...args);
      }
    };

    console.info(
      "🔇 Quiet mode enabled - reduced console noise. Use window.consoleCleanup.stats() to see filtering stats.",
    );
  }

  /**
   * Disable quiet mode - restore full logging
   */
  disableQuietMode() {
    localStorage.removeItem("quiet-logs");

    // Restore original console methods
    Object.assign(console, this.originalMethods);

    console.info("🔊 Quiet mode disabled - full logging restored.");
  }

  /**
   * Check if message should be filtered
   */
  _shouldFilterMessage(message) {
    if (typeof message !== "string") return false;

    return Array.from(this.filteredMessages).some((filtered) =>
      message.includes(filtered),
    );
  }

  /**
   * Get logging statistics
   */
  stats() {
    const total = Object.values(this.logCounts).reduce((a, b) => a + b, 0);
    return {
      total,
      breakdown: this.logCounts,
      quietMode: localStorage.getItem("quiet-logs") === "true",
      filteredPatterns: this.filteredMessages.size,
    };
  }

  /**
   * Clear console and reset counters
   */
  clear() {
    console.clear();
    this.logCounts = { info: 0, warn: 0, error: 0, debug: 0 };
    console.info("🧹 Console cleared and log counters reset.");
  }

  /**
   * Show help for console cleanup
   */
  help() {
    const help = `
🧹 CONSOLE CLEANUP UTILITY

Available Commands:
• window.consoleCleanup.enableQuietMode()  - Reduce console noise
• window.consoleCleanup.disableQuietMode() - Restore full logging  
• window.consoleCleanup.clear()            - Clear console & reset counters
• window.consoleCleanup.stats()            - Show logging statistics
• window.consoleCleanup.help()             - Show this help

Current Status:
• Quiet Mode: ${localStorage.getItem("quiet-logs") === "true" ? "✅ Enabled" : "❌ Disabled"}
• Total Logs: ${Object.values(this.logCounts).reduce((a, b) => a + b, 0)}
• Filtered Patterns: ${this.filteredMessages.size}

Keyboard Shortcuts:
• Ctrl+Shift+K (or Cmd+Option+K) - Open console
• Ctrl+L (or Cmd+K) - Clear console
    `;
    console.log(help);
  }

  /**
   * Add custom filter pattern
   */
  addFilter(pattern) {
    this.filteredMessages.add(pattern);
    console.info(`🔇 Added filter pattern: "${pattern}"`);
  }

  /**
   * Remove filter pattern
   */
  removeFilter(pattern) {
    this.filteredMessages.delete(pattern);
    console.info(`🔊 Removed filter pattern: "${pattern}"`);
  }

  /**
   * Show current filter patterns
   */
  showFilters() {
    console.log(
      "🔇 Current filter patterns:",
      Array.from(this.filteredMessages),
    );
  }
}

// Initialize and make globally available
const consoleCleanup = new ConsoleCleanup();
consoleCleanup.init();

// Make available globally
window.consoleCleanup = consoleCleanup;

// Quick shortcuts
window.quietLogs = () => consoleCleanup.enableQuietMode();
window.verboseLogs = () => consoleCleanup.disableQuietMode();
window.clearLogs = () => consoleCleanup.clear();

export default consoleCleanup;
