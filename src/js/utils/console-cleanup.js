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
      "🎨 Theme validation available",
      "CSS Optimization Results",
      "📊 Performance Improvements:",
      "⚡ Real-World Performance Impact:",
      "📁 Before Consolidation:",
      "📁 After Consolidation:",
      "🎯 Architecture Benefits:",
      "🎯 State Management CSS Optimization",
      "🎛️ Class-Specific Analysis:",
      "🚀 Overall Improvement:",
      "📈 Specific Benefits:",
      "⏱️ Page Load State Change Simulation",
      "🔄 CSS Layers Migration Analysis",
      "📊 Current Status:",
      "🚀 Migration Plan:",
      "📋 Phase",
      "🎯 Expected Benefits:",
      "⏱️ Estimated effort:",
      "🔍 CSS Layers Diagnostic Report",
      "📱 Browser Support:",
      "🎨 Color System Values:",
      "📝 Font System:",
      "📊 CSS Layers Implementation:",
      "📈 Layer Summary:",
      "📋 Diagnostic Summary:",
      "🔧 Recommendations:",
      "💡 Quick Fixes:",
      "🎯 Testing styles for:",
      "Element",
      "• Color:",
      "• Background:",
      "• Font Size:",
      "• Font Family:",
      "📈 Real-World Performance Metrics",
      "Total CSS files loaded:",
      "Total CSS load time:",
      "Average per file:",
      "Estimated",
      "Hero-related files:",
      "🔧 Tooltip Auto-Initializer:",
      "Found",
      "Processed",
      "rings",
      "DataHandler integration active",
      "Running in standalone mode",
      "ℹ️",
      "🔗",
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
      group: console.group.bind(console),
      groupEnd: console.groupEnd.bind(console),
    };

    this.isInitialized = true;
    try {
      const debugOn =
        (typeof localStorage !== "undefined" &&
          (localStorage.getItem("debug") === "true" ||
            localStorage.getItem("verbose-logs") === "true")) ||
        false;

      // Auto-enable quiet mode by default unless debug/verbose explicitly enabled
      if (!debugOn) {
        // Persist preference so users can opt-out by calling verboseLogs()
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("quiet-logs", "true");
        }
        this.enableQuietMode({ silent: true });
      }
    } catch (_) {
      // no-op
    }
  }

  /**
   * Enable quiet mode - reduces console noise significantly
   */
  enableQuietMode(options = {}) {
    const { silent = false } = options;
    try {
      localStorage.setItem("quiet-logs", "true");
    } catch (_) {
      // no-op
    }

    // Override console methods to filter noise
    console.info = () => {
      // fully suppress info in quiet mode
      this.logCounts.info++;
    };

    console.warn = (...args) => {
      // Always show warnings but count them
      this.logCounts.warn++;
      this.originalMethods.warn(...args);
    };

    console.error = (...args) => {
      // Always show errors but count them
      this.logCounts.error++;
      this.originalMethods.error(...args);
    };

    console.log = () => {
      // fully suppress generic logs in quiet mode
    };

    console.group = () => {
      // suppress groups in quiet mode
    };

    console.groupEnd = () => {
      // Usually called after filtered content, so suppress
    };

    if (!silent) {
      this.originalMethods.info(
        "🔇 Quiet mode enabled - reduced console noise. Use window.consoleCleanup.stats() to see filtering stats.",
      );
    }
  }

  /**
   * Disable quiet mode - restore full logging
   */
  disableQuietMode() {
    try {
      localStorage.removeItem("quiet-logs");
    } catch (_) {
      // no-op
    }

    // Restore original console methods
    Object.assign(console, this.originalMethods);

    this.originalMethods.info(
      "🔊 Quiet mode disabled - full logging restored.",
    );
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
