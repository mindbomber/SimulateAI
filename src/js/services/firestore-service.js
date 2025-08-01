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
 * FirestoreService - UID-based Firestore Operations for SimulateAI
 *
 * This service implements the standardized Firestore structure:
 * - users/{uid}/ (main user documents)
 * - users/{uid}/simulations/ (simulation progress)
 * - users/{uid}/badges/ (earned badges)
 * - users/{uid}/progress/ (learning progress)
 * - users/{uid}/sessions/ (user sessions)
 *
 * All operations use the UID normalizer for consistent user identification
 */

import { UIDNormalizer } from "../utils/uid-normalizer.js";

export class FirestoreService {
  constructor(firebaseService, authService) {
    this.firebaseService = firebaseService;
    this.authService = authService;
    this.db = null;
    this.uidNormalizer = null;

    // Don't auto-initialize to prevent service duplication
    // Call initialize() manually or let ServiceManager handle it
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      // Wait for Firebase to be ready
      await this.firebaseService.initialize();
      this.db = this.firebaseService.db;

      // Initialize UID normalizer
      this.uidNormalizer = new UIDNormalizer(this.authService);
    } catch (error) {
      throw new Error(
        `FirestoreService initialization failed: ${error.message}`,
      );
    }
  }

  /**
   * Ensure service is ready for operations
   */
  ensureReady() {
    if (!this.db || !this.uidNormalizer) {
      throw new Error("FirestoreService not initialized");
    }
  }

  // ============================================================================
  // USER DOCUMENT OPERATIONS
  // ============================================================================

  /**
   * Create a new user document with the standardized structure
   */
  async createUserDocument(userData = {}) {
    try {
      this.ensureReady();

      // Get validated UID
      const uid = this.uidNormalizer.requireUID("user document creation");

      // Create document path
      const userDocPath = this.uidNormalizer.createUserDocPath("users");

      // Prepare standardized user document
      const userDoc = this.uidNormalizer.createUserDataObject({
        displayName: userData.displayName || "",
        role: userData.role || "learner",
        email: userData.email || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          notifications: userData.notifications ?? true,
          publicProfile: userData.publicProfile ?? false,
          dataSharing: userData.dataSharing ?? true,
          ...userData.preferences,
        },
        profile: {
          avatar: userData.avatar || "",
          bio: userData.bio || "",
          customization: userData.customization || {},
          ...userData.profile,
        },
        ...userData, // Allow additional fields
      });

      // Import Firebase functions
      const { doc, setDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      // Create the document
      const docRef = doc(this.db, userDocPath);
      await setDoc(docRef, userDoc);

      return {
        success: true,
        uid,
        path: userDocPath,
        data: userDoc,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user document by UID
   */
  async getUserDocument(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const userDocPath = this.uidNormalizer.createUserDocPath(
        "users",
        validUID,
      );

      const { doc, getDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, userDocPath);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: docSnap.data(),
          exists: true,
        };
      } else {
        return {
          success: true,
          data: null,
          exists: false,
          message: "User document not found",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update user document
   */
  async updateUserDocument(updateData, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const userDocPath = this.uidNormalizer.createUserDocPath(
        "users",
        validUID,
      );

      const { doc, updateDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      // Add updated timestamp
      const updatePayload = {
        ...updateData,
        updatedAt: new Date(),
      };

      const docRef = doc(this.db, userDocPath);
      await updateDoc(docRef, updatePayload);

      return {
        success: true,
        uid: validUID,
        data: updatePayload,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete user document (use with caution)
   */
  async deleteUserDocument(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const userDocPath = this.uidNormalizer.createUserDocPath(
        "users",
        validUID,
      );

      const { doc, deleteDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, userDocPath);
      await deleteDoc(docRef);

      return { success: true, uid: validUID };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // SIMULATION PROGRESS OPERATIONS
  // ============================================================================

  /**
   * Save simulation progress
   */
  async saveSimulationProgress(simulationId, progressData, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const progressPath = `users/${validUID}/simulations/${simulationId}`;

      const progressDoc = {
        simulationId,
        uid: validUID,
        ...progressData,
        completedAt: progressData.completedAt || new Date(),
        updatedAt: new Date(),
      };

      const { doc, setDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, progressPath);
      await setDoc(docRef, progressDoc, { merge: true });

      return {
        success: true,
        simulationId,
        uid: validUID,
        data: progressDoc,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get simulation progress for a specific simulation
   */
  async getSimulationProgress(simulationId, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const progressPath = `users/${validUID}/simulations/${simulationId}`;

      const { doc, getDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, progressPath);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: docSnap.data(),
          exists: true,
        };
      } else {
        return {
          success: true,
          data: null,
          exists: false,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all simulations for a user
   */
  async getUserSimulations(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const simulationsPath = `users/${validUID}/simulations`;

      const { collection, getDocs, orderBy, query } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const simulationsRef = collection(this.db, simulationsPath);
      const q = query(simulationsRef, orderBy("completedAt", "desc"));
      const snapshot = await getDocs(q);

      const simulations = [];
      snapshot.forEach((doc) => {
        simulations.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        simulations,
        count: simulations.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // BADGE OPERATIONS
  // ============================================================================

  /**
   * Award a badge to a user
   */
  async awardBadge(badgeId, badgeData, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const badgePath = `users/${validUID}/badges/${badgeId}`;

      const badgeDoc = {
        badgeId,
        uid: validUID,
        ...badgeData,
        earnedAt: badgeData.earnedAt || new Date(),
        isVisible: badgeData.isVisible ?? true,
        isSelectedFlair: badgeData.isSelectedFlair ?? false,
      };

      const { doc, setDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, badgePath);
      await setDoc(docRef, badgeDoc);

      return {
        success: true,
        badgeId,
        uid: validUID,
        data: badgeDoc,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all badges for a user
   */
  async getUserBadges(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const badgesPath = `users/${validUID}/badges`;

      const { collection, getDocs, orderBy, query } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const badgesRef = collection(this.db, badgesPath);
      const q = query(badgesRef, orderBy("earnedAt", "desc"));
      const snapshot = await getDocs(q);

      const badges = [];
      snapshot.forEach((doc) => {
        badges.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        badges,
        count: badges.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // PROGRESS TRACKING OPERATIONS
  // ============================================================================

  /**
   * Update learning progress for a category
   */
  async updateCategoryProgress(categoryId, progressData, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const progressPath = `users/${validUID}/progress/${categoryId}`;

      const progressDoc = {
        categoryId,
        uid: validUID,
        ...progressData,
        lastActivity: new Date(),
        updatedAt: new Date(),
      };

      const { doc, setDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, progressPath);
      await setDoc(docRef, progressDoc, { merge: true });

      return {
        success: true,
        categoryId,
        uid: validUID,
        data: progressDoc,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get learning progress for a category
   */
  async getCategoryProgress(categoryId, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const progressPath = `users/${validUID}/progress/${categoryId}`;

      const { doc, getDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, progressPath);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        return {
          success: true,
          categoryId,
          uid: validUID,
          data: docSnapshot.data(),
        };
      } else {
        return {
          success: true,
          categoryId,
          uid: validUID,
          data: null, // No progress yet
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const progressPath = `users/${validUID}/progress`;

      const { collection, getDocs, orderBy, query } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const progressRef = collection(this.db, progressPath);
      const q = query(progressRef, orderBy("lastActivity", "desc"));
      const snapshot = await getDocs(q);

      const progress = [];
      snapshot.forEach((doc) => {
        progress.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        progress,
        count: progress.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // SESSION TRACKING OPERATIONS
  // ============================================================================

  /**
   * Start a new user session
   */
  async startSession(sessionData = {}, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const sessionId = sessionData.sessionId || `session_${Date.now()}`;
      const sessionPath = `users/${validUID}/sessions/${sessionId}`;

      const sessionDoc = {
        sessionId,
        uid: validUID,
        startTime: new Date(),
        endTime: null,
        actionsCount: 0,
        metadata: sessionData.metadata || {},
        ...sessionData,
      };

      const { doc, setDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, sessionPath);
      await setDoc(docRef, sessionDoc);

      return {
        success: true,
        sessionId,
        uid: validUID,
        data: sessionDoc,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * End a user session
   */
  async endSession(sessionId, sessionData = {}, uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);
      const sessionPath = `users/${validUID}/sessions/${sessionId}`;

      const updateData = {
        endTime: new Date(),
        ...sessionData,
      };

      const { doc, updateDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const docRef = doc(this.db, sessionPath);
      await updateDoc(docRef, updateData);

      return {
        success: true,
        sessionId,
        uid: validUID,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // DATA DELETION OPERATIONS (GDPR COMPLIANCE)
  // ============================================================================

  /**
   * Delete all user data across all subcollections (GDPR compliant)
   */
  async deleteAllUserData(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);

      // Collections to delete
      const subcollections = ["simulations", "badges", "progress", "sessions"];

      // Delete all subcollections first
      for (const subcollection of subcollections) {
        await this.deleteSubcollection(validUID, subcollection);
      }

      // Finally delete the main user document
      await this.deleteUserDocument(validUID);

      return {
        success: true,
        uid: validUID,
        deletedCollections: ["users", ...subcollections],
        message: "All user data has been permanently deleted",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete all documents in a user subcollection
   */
  async deleteSubcollection(uid, subcollectionName) {
    try {
      const subcollectionPath = `users/${uid}/${subcollectionName}`;

      const { collection, getDocs, doc, deleteDoc } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const subcollectionRef = collection(this.db, subcollectionPath);
      const snapshot = await getDocs(subcollectionRef);

      // Delete all documents in batches to avoid hitting rate limits
      const deletePromises = [];
      snapshot.forEach((docSnapshot) => {
        const docRef = doc(this.db, subcollectionPath, docSnapshot.id);
        deletePromises.push(deleteDoc(docRef));
      });

      await Promise.all(deletePromises);

      return {
        success: true,
        collection: subcollectionName,
        deletedCount: snapshot.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        collection: subcollectionName,
      };
    }
  }

  /**
   * Export all user data for data portability (GDPR compliance)
   */
  async exportAllUserData(uid = null) {
    try {
      this.ensureReady();

      const validUID = this.uidNormalizer.getValidatedUID(uid);

      // Get user document
      const userResult = await this.getUserDocument(validUID);

      // Get all subcollection data
      const simulationsResult = await this.getUserSimulations(validUID);
      const badgesResult = await this.getUserBadges(validUID);
      const progressResult = await this.getUserProgress(validUID);

      const exportData = {
        exportDate: new Date().toISOString(),
        uid: validUID,
        userData: userResult.success ? userResult.data : null,
        simulations: simulationsResult.success
          ? simulationsResult.simulations
          : [],
        badges: badgesResult.success ? badgesResult.badges : [],
        progress: progressResult.success ? progressResult.progress : [],
        metadata: {
          exportedCollections: ["users", "simulations", "badges", "progress"],
          totalDocuments:
            (simulationsResult.count || 0) +
            (badgesResult.count || 0) +
            (progressResult.count || 0) +
            (userResult.data ? 1 : 0),
        },
      };

      return {
        success: true,
        data: exportData,
        downloadableJson: JSON.stringify(exportData, null, 2),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get the current user's UID (delegated to UID normalizer)
   */
  getCurrentUID() {
    return this.uidNormalizer?.getCurrentUID() || null;
  }

  /**
   * Check if a UID is valid (delegated to UID normalizer)
   */
  isValidUID(uid) {
    return this.uidNormalizer?.isValidUID(uid) || false;
  }

  /**
   * Create a document path using UID normalizer
   */
  createUserDocPath(collection = "users", uid = null) {
    return this.uidNormalizer?.createUserDocPath(collection, uid);
  }

  /**
   * Check if user document exists
   */
  async userExists(uid = null) {
    const result = await this.getUserDocument(uid);
    return result.success && result.exists;
  }

  /**
   * Create user document if it doesn't exist
   */
  async ensureUserDocument(userData = {}, uid = null) {
    const exists = await this.userExists(uid);

    if (!exists) {
      return await this.createUserDocument(userData);
    }

    return {
      success: true,
      exists: true,
      message: "User document already exists",
    };
  }

  /**
   * Batch operation to update multiple documents
   */
  async batchUpdate(operations) {
    try {
      this.ensureReady();

      const { writeBatch } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
      );

      const batch = writeBatch(this.db);

      for (const operation of operations) {
        const { type, path, data } = operation;
        const { doc } = await import(
          "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
        );
        const docRef = doc(this.db, path);

        switch (type) {
          case "set":
            batch.set(docRef, data);
            break;
          case "update":
            batch.update(docRef, data);
            break;
          case "delete":
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();

      return {
        success: true,
        operationsCount: operations.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
