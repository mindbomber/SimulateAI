/**
 * UID Normalization Utility for SimulateAI
 * Provides consistent UID management across all Firebase services
 */

export class UIDNormalizer {
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Get the current authenticated user's UID
   * Central source of truth for all UID operations
   */
  getCurrentUID() {
    return this.authService?.currentUser?.uid || null;
  }

  /**
   * Validate UID format and existence
   */
  isValidUID(uid) {
    if (!uid || typeof uid !== 'string') return false;
    // Firebase UIDs are typically 28+ characters, alphanumeric with some special chars
    return /^[a-zA-Z0-9_-]{20,}$/.test(uid);
  }

  /**
   * Get validated UID with error handling
   */
  getValidatedUID(providedUID = null) {
    const uid = providedUID || this.getCurrentUID();

    if (!uid) {
      throw new Error('Authentication required - no UID available');
    }

    if (!this.isValidUID(uid)) {
      throw new Error(`Invalid UID format: ${uid}`);
    }

    return uid;
  }

  /**
   * Require authentication for UID-based operations
   */
  requireUID(operation = 'operation') {
    const uid = this.getCurrentUID();
    if (!uid) {
      throw new Error(`Authentication required for ${operation}`);
    }
    return uid;
  }

  /**
   * Create UID-based document path for Firestore
   */
  createUserDocPath(collection = 'users', uid = null) {
    const validUID = this.getValidatedUID(uid);
    return `${collection}/${validUID}`;
  }

  /**
   * Create UID-based storage path
   */
  createStoragePath(basePath, filename = '', uid = null) {
    const validUID = this.getValidatedUID(uid);
    return `${basePath}/${validUID}/${filename}`.replace(/\/+/g, '/');
  }

  /**
   * Standardize analytics user_id field
   */
  getAnalyticsUID(uid = null) {
    return this.getValidatedUID(uid);
  }

  /**
   * Create UID-based cache key
   */
  createCacheKey(prefix, suffix = '', uid = null) {
    const validUID = this.getValidatedUID(uid);
    const suffixPart = suffix ? `_${suffix}` : '';
    return `${prefix}_${validUID}${suffixPart}`;
  }

  /**
   * Batch operations with UID validation
   */
  validateUIDs(uids) {
    const validUIDs = [];
    const invalidUIDs = [];

    uids.forEach(uid => {
      if (this.isValidUID(uid)) {
        validUIDs.push(uid);
      } else {
        invalidUIDs.push(uid);
      }
    });

    return { validUIDs, invalidUIDs };
  }

  /**
   * Create standardized user data object with UID
   */
  createUserDataObject(additionalData = {}, uid = null) {
    const validUID = this.getValidatedUID(uid);

    return {
      uid: validUID,
      user_id: validUID, // For analytics
      userId: validUID, // Alternative format
      timestamp: new Date().toISOString(),
      ...additionalData,
    };
  }

  /**
   * UID-based error logging
   */
  logUIDError(error, operation, uid = null) {
    const userUID = uid || this.getCurrentUID() || 'anonymous';
    // Log UID errors for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[UID Error] ${operation}:`, {
        error: error.message,
        uid: userUID,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Check if current user matches provided UID (security check)
   */
  isCurrentUser(uid) {
    const currentUID = this.getCurrentUID();
    return currentUID && currentUID === uid;
  }

  /**
   * Get user-scoped collection reference path
   */
  getUserCollectionPath(collection, uid = null) {
    const validUID = this.getValidatedUID(uid);
    return `users/${validUID}/${collection}`;
  }

  /**
   * Create security rules compatible UID structure
   */
  createSecureUserPath(resource, uid = null) {
    const validUID = this.getValidatedUID(uid);
    return {
      path: `${resource}/{uid}`,
      uid: validUID,
      fullPath: `${resource}/${validUID}`,
    };
  }
}

/**
 * Global UID utility functions
 */
export const UIDUtils = {
  /**
   * Extract UID from document path
   */
  extractUIDFromPath(path) {
    const match = path.match(/\/([a-zA-Z0-9_-]{20,})/);
    return match ? match[1] : null;
  },

  /**
   * Sanitize UID for use in various contexts
   */
  sanitizeUID(uid) {
    if (!uid) return null;
    return uid.replace(/[^a-zA-Z0-9_-]/g, '');
  },

  /**
   * Generate mock UID for testing (not for production)
   */
  generateMockUID() {
    const BASE_36 = 36;
    const UID_LENGTH = 24;
    const randomPart = Math.random().toString(BASE_36).substr(2, UID_LENGTH);
    return `test_${randomPart}`;
  },

  /**
   * Compare UIDs safely
   */
  compareUIDs(uid1, uid2) {
    return uid1 && uid2 && uid1.toString() === uid2.toString();
  },
};

// Export singleton pattern for global use
let globalUIDNormalizer = null;

export function initializeUIDNormalizer(authService) {
  globalUIDNormalizer = new UIDNormalizer(authService);
  return globalUIDNormalizer;
}

export function getUIDNormalizer() {
  if (!globalUIDNormalizer) {
    throw new Error(
      'UID Normalizer not initialized. Call initializeUIDNormalizer first.'
    );
  }
  return globalUIDNormalizer;
}

export default UIDNormalizer;
