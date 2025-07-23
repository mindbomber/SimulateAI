/**
 * Component Error Utility
 *
 * Enhanced error class for component-specific error handling
 * with context tracking and debugging information.
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Enhanced error class for component-specific errors with additional
 * context information for better debugging and error tracking.
 */
export class ComponentError extends Error {
  constructor(message, component, context = {}) {
    super(message);
    this.name = "ComponentError";
    this.component = component;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ComponentError);
    }
  }

  /**
   * Get a formatted error message with component and context information
   */
  getFormattedMessage() {
    const contextStr =
      Object.keys(this.context).length > 0
        ? ` Context: ${JSON.stringify(this.context)}`
        : "";

    return `[${this.component}] ${this.message}${contextStr} (${this.timestamp})`;
  }

  /**
   * Convert error to a serializable object for logging
   */
  toSerializable() {
    return {
      name: this.name,
      message: this.message,
      component: this.component,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Create a ComponentError from a regular Error
   */
  static fromError(error, component, context = {}) {
    const componentError = new ComponentError(error.message, component, {
      ...context,
      originalError: error.name,
      originalStack: error.stack,
    });

    // Preserve original stack if available
    if (error.stack) {
      componentError.stack = error.stack;
    }

    return componentError;
  }
}
