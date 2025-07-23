/**
 * Validation Utilities - Refactored Common Patterns
 *
 * This module consolidates duplicate validation patterns found
 * throughout the codebase, particularly in helpers.js and components
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Common validation utilities to eliminate duplicate validation patterns
 */
export class ValidationUtils {
  /**
   * Validate array with standardized error handling
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateArray(value, options = {}) {
    const {
      allowEmpty = false,
      minLength = 0,
      maxLength = Infinity,
      returnDefault = [],
    } = options;

    // Standard array validation pattern found throughout codebase
    if (!Array.isArray(value)) {
      return {
        isValid: false,
        value: returnDefault,
        error: "Value must be an array",
      };
    }

    if (!allowEmpty && value.length === 0) {
      return {
        isValid: false,
        value: returnDefault,
        error: "Array cannot be empty",
      };
    }

    if (value.length < minLength) {
      return {
        isValid: false,
        value: returnDefault,
        error: `Array must have at least ${minLength} items`,
      };
    }

    if (value.length > maxLength) {
      return {
        isValid: false,
        value: value.slice(0, maxLength),
        error: `Array truncated to ${maxLength} items`,
      };
    }

    return {
      isValid: true,
      value,
      error: null,
    };
  }

  /**
   * Validate string with common patterns
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateString(value, options = {}) {
    const {
      allowEmpty = false,
      minLength = 0,
      maxLength = Infinity,
      pattern = null,
      returnDefault = "",
    } = options;

    if (typeof value !== "string") {
      return {
        isValid: false,
        value: returnDefault,
        error: "Value must be a string",
      };
    }

    if (!allowEmpty && value.length === 0) {
      return {
        isValid: false,
        value: returnDefault,
        error: "String cannot be empty",
      };
    }

    if (value.length < minLength) {
      return {
        isValid: false,
        value: returnDefault,
        error: `String must be at least ${minLength} characters`,
      };
    }

    if (value.length > maxLength) {
      return {
        isValid: false,
        value: value.substring(0, maxLength),
        error: `String truncated to ${maxLength} characters`,
      };
    }

    if (pattern && !pattern.test(value)) {
      return {
        isValid: false,
        value: returnDefault,
        error: "String does not match required pattern",
      };
    }

    return {
      isValid: true,
      value,
      error: null,
    };
  }

  /**
   * Validate number with common patterns
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateNumber(value, options = {}) {
    const {
      min = -Infinity,
      max = Infinity,
      allowNaN = false,
      allowInfinite = false,
      returnDefault = 0,
    } = options;

    const numValue = Number(value);

    if (isNaN(numValue) && !allowNaN) {
      return {
        isValid: false,
        value: returnDefault,
        error: "Value must be a valid number",
      };
    }

    if (!isFinite(numValue) && !allowInfinite) {
      return {
        isValid: false,
        value: returnDefault,
        error: "Value must be finite",
      };
    }

    if (numValue < min) {
      return {
        isValid: false,
        value: min,
        error: `Value cannot be less than ${min}`,
      };
    }

    if (numValue > max) {
      return {
        isValid: false,
        value: max,
        error: `Value cannot be greater than ${max}`,
      };
    }

    return {
      isValid: true,
      value: numValue,
      error: null,
    };
  }

  /**
   * Validate function with common patterns
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateFunction(value, options = {}) {
    const { returnDefault = () => {}, allowAsync = true } = options;

    if (typeof value !== "function") {
      return {
        isValid: false,
        value: returnDefault,
        error: "Value must be a function",
      };
    }

    if (!allowAsync && value.constructor.name === "AsyncFunction") {
      return {
        isValid: false,
        value: returnDefault,
        error: "Async functions not allowed",
      };
    }

    return {
      isValid: true,
      value,
      error: null,
    };
  }

  /**
   * Validate object with common patterns
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateObject(value, options = {}) {
    const {
      allowNull = false,
      requiredKeys = [],
      returnDefault = {},
    } = options;

    if (value === null) {
      if (allowNull) {
        return { isValid: true, value: null, error: null };
      }
      return {
        isValid: false,
        value: returnDefault,
        error: "Value cannot be null",
      };
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      return {
        isValid: false,
        value: returnDefault,
        error: "Value must be an object",
      };
    }

    // Check required keys
    for (const key of requiredKeys) {
      if (!(key in value)) {
        return {
          isValid: false,
          value: returnDefault,
          error: `Missing required key: ${key}`,
        };
      }
    }

    return {
      isValid: true,
      value,
      error: null,
    };
  }

  /**
   * Safe array operation wrapper - consolidates array validation patterns
   * @param {any} array - Array to validate
   * @param {Function} operation - Operation to perform on valid array
   * @param {any} defaultReturn - Default return value for invalid arrays
   * @returns {any} Operation result or default
   */
  static safeArrayOperation(array, operation, defaultReturn = []) {
    const validation = this.validateArray(array, { allowEmpty: false });

    if (!validation.isValid) {
      return defaultReturn;
    }

    try {
      return operation(validation.value);
    } catch (error) {
      console.warn("Array operation failed:", error);
      return defaultReturn;
    }
  }

  /**
   * Batch validation for multiple values
   * @param {Array} validations - Array of validation configurations
   * @returns {Object} Batch validation result
   */
  static validateBatch(validations) {
    const results = {};
    let allValid = true;
    const errors = [];

    for (const { key, value, type, options = {} } of validations) {
      let result;

      switch (type) {
        case "array":
          result = this.validateArray(value, options);
          break;
        case "string":
          result = this.validateString(value, options);
          break;
        case "number":
          result = this.validateNumber(value, options);
          break;
        case "function":
          result = this.validateFunction(value, options);
          break;
        case "object":
          result = this.validateObject(value, options);
          break;
        default:
          result = {
            isValid: false,
            value,
            error: `Unknown validation type: ${type}`,
          };
      }

      results[key] = result;

      if (!result.isValid) {
        allValid = false;
        errors.push(`${key}: ${result.error}`);
      }
    }

    return {
      isValid: allValid,
      results,
      errors,
    };
  }
}

/**
 * Common type checking utilities found throughout codebase
 */
export class TypeUtils {
  /**
   * Check if value is a non-empty array (common pattern)
   */
  static isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  /**
   * Check if value is a non-empty string (common pattern)
   */
  static isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
  }

  /**
   * Check if value is a valid number (common pattern)
   */
  static isValidNumber(value) {
    return typeof value === "number" && isFinite(value) && !isNaN(value);
  }

  /**
   * Check if value is a plain object (common pattern)
   */
  static isPlainObject(value) {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.constructor === Object
    );
  }

  /**
   * Safe property access (common pattern)
   */
  static safeGet(obj, path, defaultValue = null) {
    if (!this.isPlainObject(obj)) return defaultValue;

    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return defaultValue;
      }
      current = current[key];
    }

    return current;
  }
}

export default ValidationUtils;
