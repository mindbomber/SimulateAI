/**
 * Real-Time Classroom Service for Firebase Realtime Database Operations
 * Handles teacher-student classroom collaboration functionality
 * @class RealtimeClassroomService
 * @author SimulateAI Development Team
 * @since 1.80.0
 */

import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  remove,
  serverTimestamp,
} from "firebase/database";
import logger from "../utils/logger.js";
import { CLASSROOM_CONSTANTS } from "../constants/classroom-constants.js";
import {
  generateClassroomCode,
  validateClassroomCode,
} from "../utils/classroom-utils.js";

export default class RealtimeClassroomService {
  constructor(firebaseService) {
    this.firebaseService = firebaseService;
    this.database = null;
    this.listeners = new Map(); // Track active listeners for cleanup
    this.isConnected = false;
    this.fallbackMode = false; // Use localStorage when Firebase is unavailable
    this.initializationPromise = null; // Track initialization status

    // Start initialization but don't wait for it in constructor
    this.initializationPromise = this.initializeDatabase();
  }

  /**
   * Initialize Firebase Realtime Database connection
   * @private
   */
  async initializeDatabase() {
    try {
      // Check if Firebase service and app are properly initialized
      if (!this.firebaseService || !this.firebaseService.app) {
        logger.warn(
          "RealtimeClassroomService",
          "Firebase app not initialized, using fallback mode",
        );
        this.fallbackMode = true;
        this.isConnected = true; // Mark as connected for fallback mode
        return;
      }

      // Try to initialize the database
      this.database = getDatabase(this.firebaseService.app);

      // Test the connection with a simple operation
      try {
        const testRef = ref(this.database, ".info/connected");
        // This will throw if database URL is invalid or connection fails
        await get(testRef);
        this.isConnected = true;
        this.fallbackMode = false;

        logger.info(
          "RealtimeClassroomService",
          "Database initialized successfully with Firebase",
        );
      } catch (connectionError) {
        logger.warn(
          "RealtimeClassroomService",
          "Firebase database connection failed, using fallback mode",
          connectionError,
        );
        this.fallbackMode = true;
        this.isConnected = true; // Mark as connected for fallback mode
        this.database = null; // Clear the database reference
      }
    } catch (error) {
      logger.warn(
        "RealtimeClassroomService",
        "Failed to initialize database, using fallback mode",
        error,
      );
      this.fallbackMode = true;
      this.isConnected = true; // Mark as connected for fallback mode
      this.database = null; // Clear the database reference
    }
  }

  /**
   * Create a new classroom with scenarios and instructor information
   * @param {Object} classroomData - Classroom configuration
   * @param {string} classroomData.classroomName - Name of the classroom
   * @param {string} classroomData.instructorId - Firebase UID of instructor
   * @param {string} classroomData.instructorName - Display name of instructor
   * @param {Array} classroomData.selectedScenarios - Array of scenario objects
   * @returns {Promise<Object>} Created classroom with code and ID
   */
  async createClassroom(classroomData) {
    // Wait for initialization to complete before proceeding with timeout
    if (this.initializationPromise) {
      try {
        // Add timeout to prevent infinite hanging
        await Promise.race([
          this.initializationPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Initialization timeout")),
              10000,
            ),
          ),
        ]);
      } catch (error) {
        logger.warn(
          "RealtimeClassroomService",
          "Initialization failed or timed out during classroom creation, forcing fallback mode",
          error,
        );
        this.fallbackMode = true;
        this.isConnected = false;
      }
    }

    // Note: We allow creation in both connected and fallback modes
    // The service handles both Firebase and localStorage automatically

    try {
      // Generate unique classroom code
      const classroomCode = await this.generateUniqueClassroomCode();

      // Create classroom object
      const classroom = {
        classroomId: `classroom_${Date.now()}`,
        classroomName: classroomData.classroomName,
        classroomCode: classroomCode,
        instructorId: classroomData.instructorId,
        instructorName: classroomData.instructorName,
        dateCreated: new Date().toISOString(),
        selectedScenarios: classroomData.selectedScenarios || [],
        sessionStatus: {
          isLive: false,
          isPaused: false,
          currentScenario: 0,
          startTime: null,
          completedAt: null,
        },
        roster: {},
        studentChoices: {},
        settings: {
          maxStudents: CLASSROOM_CONSTANTS.MAX_STUDENTS,
          allowLateJoining: true,
          sessionTimeoutMinutes: CLASSROOM_CONSTANTS.SESSION_TIMEOUT_MINUTES,
        },
      };

      if (this.fallbackMode) {
        // Use localStorage fallback
        return await this.createClassroomFallback(classroom);
      } else {
        // Use Firebase Realtime Database
        return await this.createClassroomFirebase(classroom);
      }
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to create classroom",
        error,
      );
      throw error;
    }
  }

  /**
   * Create classroom using Firebase Realtime Database
   * @private
   */
  async createClassroomFirebase(classroom) {
    const classroomRef = ref(
      this.database,
      `classrooms/${classroom.classroomCode}`,
    );
    await set(classroomRef, {
      ...classroom,
      dateCreated: serverTimestamp(), // Use Firebase server timestamp
    });

    logger.info(
      "RealtimeClassroomService",
      "Classroom created successfully in Firebase",
      {
        classroomCode: classroom.classroomCode,
        instructorId: classroom.instructorId,
      },
    );

    return classroom;
  }

  /**
   * Create classroom using localStorage fallback
   * @private
   */
  async createClassroomFallback(classroom) {
    try {
      // Get existing classrooms from localStorage
      const existingClassrooms = JSON.parse(
        localStorage.getItem("simulateai_classrooms") || "{}",
      );

      // Add new classroom
      existingClassrooms[classroom.classroomCode] = classroom;

      // Save back to localStorage
      localStorage.setItem(
        "simulateai_classrooms",
        JSON.stringify(existingClassrooms),
      );

      logger.info(
        "RealtimeClassroomService",
        "Classroom created successfully in fallback mode",
        {
          classroomCode: classroom.classroomCode,
          instructorId: classroom.instructorId,
        },
      );

      return classroom;
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to create classroom in fallback mode",
        error,
      );
      throw error;
    }
  }

  /**
   * Join a classroom as a student
   * @param {string} classroomCode - 6-character classroom code
   * @param {string} studentId - Firebase UID of student
   * @param {string} nickname - Student's chosen nickname
   * @returns {Promise<Object>} Classroom data and student info
   */
  async joinClassroom(classroomCode, studentId, nickname) {
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    try {
      // Validate classroom code format
      if (!validateClassroomCode(classroomCode)) {
        throw new Error("Invalid classroom code format");
      }

      // Check if classroom exists
      const classroomRef = ref(this.database, `classrooms/${classroomCode}`);
      const snapshot = await get(classroomRef);

      if (!snapshot.exists()) {
        throw new Error("Classroom not found");
      }

      const classroom = snapshot.val();

      // Check if session is still accepting students
      if (
        classroom.sessionStatus.isLive &&
        !classroom.settings.allowLateJoining
      ) {
        throw new Error("Session is live and not accepting new students");
      }

      // Check roster limit
      const currentRosterSize = Object.keys(classroom.roster || {}).length;
      if (currentRosterSize >= classroom.settings.maxStudents) {
        throw new Error("Classroom is full");
      }

      // Check if student already joined
      if (classroom.roster[studentId]) {
        logger.warn(
          "RealtimeClassroomService",
          "Student already in classroom",
          {
            classroomCode,
            studentId,
          },
        );
        return {
          classroomCode,
          ...classroom,
          studentInfo: classroom.roster[studentId],
        };
      }

      // Add student to roster
      const studentInfo = {
        nickname,
        joinedAt: serverTimestamp(),
        isActive: true,
        lastSeen: serverTimestamp(),
      };

      const rosterRef = ref(
        this.database,
        `classrooms/${classroomCode}/roster/${studentId}`,
      );
      await set(rosterRef, studentInfo);

      // Initialize student choices structure
      const choicesRef = ref(
        this.database,
        `classrooms/${classroomCode}/studentChoices/${studentId}`,
      );
      await set(choicesRef, {
        scenarios: {},
        overallProgress: {
          completed: 0,
          total: classroom.selectedScenarios.length,
          currentScenario: null,
        },
      });

      logger.info("RealtimeClassroomService", "Student joined classroom", {
        classroomCode,
        studentId,
        nickname,
      });

      return {
        classroomCode,
        ...classroom,
        studentInfo,
      };
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to join classroom",
        error,
      );
      throw error;
    }
  }

  /**
   * Start a live session for a classroom
   * @param {string} classroomCode - Classroom code
   * @param {string} instructorId - Instructor's Firebase UID
   * @returns {Promise<void>}
   */
  async startLiveSession(classroomCode, instructorId) {
    try {
      const sessionStatusRef = ref(
        this.database,
        `classrooms/${classroomCode}/sessionStatus`,
      );

      await set(sessionStatusRef, {
        isLive: true,
        isPaused: false,
        currentScenario: 0,
        startTime: serverTimestamp(),
        completedAt: null,
      });

      logger.info("RealtimeClassroomService", "Live session started", {
        classroomCode,
        instructorId,
      });
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to start live session",
        error,
      );
      throw error;
    }
  }

  /**
   * Pause/unpause a live session
   * @param {string} classroomCode - Classroom code
   * @param {boolean} isPaused - Whether to pause or unpause
   * @returns {Promise<void>}
   */
  async pauseSession(classroomCode, isPaused) {
    try {
      const pauseRef = ref(
        this.database,
        `classrooms/${classroomCode}/sessionStatus/isPaused`,
      );
      await set(pauseRef, isPaused);

      logger.info(
        "RealtimeClassroomService",
        `Session ${isPaused ? "paused" : "resumed"}`,
        {
          classroomCode,
        },
      );
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to pause/resume session",
        error,
      );
      throw error;
    }
  }

  /**
   * Complete a classroom session
   * @param {string} classroomCode - Classroom code
   * @returns {Promise<void>}
   */
  async completeSession(classroomCode) {
    try {
      const sessionStatusRef = ref(
        this.database,
        `classrooms/${classroomCode}/sessionStatus`,
      );

      await set(sessionStatusRef, {
        isLive: false,
        isPaused: false,
        currentScenario: null,
        startTime: null,
        completedAt: serverTimestamp(),
      });

      logger.info("RealtimeClassroomService", "Session completed", {
        classroomCode,
      });
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to complete session",
        error,
      );
      throw error;
    }
  }

  /**
   * Submit a student's choice for a scenario
   * @param {string} classroomCode - Classroom code
   * @param {string} studentId - Student's Firebase UID
   * @param {string} scenarioId - Scenario identifier
   * @param {string} choice - Student's choice
   * @param {Object} metadata - Additional choice metadata
   * @returns {Promise<void>}
   */
  async submitStudentChoice(
    classroomCode,
    studentId,
    scenarioId,
    choice,
    metadata = {},
  ) {
    try {
      const choiceData = {
        choice,
        timestamp: serverTimestamp(),
        isComplete: true,
        responseTime: metadata.responseTime || null,
        confidence: metadata.confidence || null,
      };

      const choiceRef = ref(
        this.database,
        `classrooms/${classroomCode}/studentChoices/${studentId}/scenarios/${scenarioId}`,
      );
      await set(choiceRef, choiceData);

      // Update overall progress
      await this.updateStudentProgress(classroomCode, studentId, scenarioId);

      logger.info("RealtimeClassroomService", "Student choice submitted", {
        classroomCode,
        studentId,
        scenarioId,
        choice,
      });
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to submit student choice",
        error,
      );
      throw error;
    }
  }

  /**
   * Update student's overall progress
   * @param {string} classroomCode - Classroom code
   * @param {string} studentId - Student's Firebase UID
   * @param {string} currentScenarioId - Current scenario being completed
   * @private
   */
  async updateStudentProgress(classroomCode, studentId, currentScenarioId) {
    try {
      // Get current choices to calculate completed count
      const choicesRef = ref(
        this.database,
        `classrooms/${classroomCode}/studentChoices/${studentId}/scenarios`,
      );
      const snapshot = await get(choicesRef);
      const scenarios = snapshot.val() || {};

      const completed = Object.keys(scenarios).length;

      const progressRef = ref(
        this.database,
        `classrooms/${classroomCode}/studentChoices/${studentId}/overallProgress`,
      );

      // Get total scenarios count
      const classroomRef = ref(
        this.database,
        `classrooms/${classroomCode}/selectedScenarios`,
      );
      const classroomSnapshot = await get(classroomRef);
      const selectedScenarios = classroomSnapshot.val() || [];

      await set(progressRef, {
        completed,
        total: selectedScenarios.length,
        currentScenario: currentScenarioId,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to update student progress",
        error,
      );
    }
  }

  /**
   * Set up real-time listener for classroom roster changes
   * @param {string} classroomCode - Classroom code
   * @param {Function} callback - Callback function for roster updates
   * @returns {Function} Unsubscribe function
   */
  listenToRoster(classroomCode, callback) {
    const rosterRef = ref(this.database, `classrooms/${classroomCode}/roster`);
    const listenerId = `roster_${classroomCode}`;

    const unsubscribe = onValue(rosterRef, (snapshot) => {
      const roster = snapshot.val() || {};
      callback(roster);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Set up real-time listener for session status changes
   * @param {string} classroomCode - Classroom code
   * @param {Function} callback - Callback function for status updates
   * @returns {Function} Unsubscribe function
   */
  listenToSessionStatus(classroomCode, callback) {
    const statusRef = ref(
      this.database,
      `classrooms/${classroomCode}/sessionStatus`,
    );
    const listenerId = `status_${classroomCode}`;

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val() || {};
      callback(status);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Set up real-time listener for student choices
   * @param {string} classroomCode - Classroom code
   * @param {Function} callback - Callback function for choice updates
   * @returns {Function} Unsubscribe function
   */
  listenToStudentChoices(classroomCode, callback) {
    const choicesRef = ref(
      this.database,
      `classrooms/${classroomCode}/studentChoices`,
    );
    const listenerId = `choices_${classroomCode}`;

    const unsubscribe = onValue(choicesRef, (snapshot) => {
      const choices = snapshot.val() || {};
      callback(choices);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      unsubscribe();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Generate a unique classroom code
   * @private
   * @returns {Promise<string>} Unique 6-character classroom code
   */
  async generateUniqueClassroomCode() {
    // Wait for initialization to complete with timeout
    if (this.initializationPromise) {
      try {
        // Add a timeout to prevent infinite hanging
        await Promise.race([
          this.initializationPromise,
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Initialization timeout")),
              10000,
            ),
          ),
        ]);
      } catch (error) {
        logger.warn(
          "RealtimeClassroomService",
          "Initialization failed or timed out, forcing fallback mode",
          error,
        );
        this.fallbackMode = true;
        this.isConnected = false;
      }
    }

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateClassroomCode();

      // Always use fallback mode if database is not properly initialized
      if (this.fallbackMode || !this.database) {
        // Check in localStorage
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        if (!existingClassrooms[code]) {
          logger.info(
            "RealtimeClassroomService",
            `Generated classroom code in fallback mode: ${code}`,
          );
          return code;
        }
      } else {
        try {
          // Check if code already exists in Firebase
          const classroomRef = ref(this.database, `classrooms/${code}`);
          const snapshot = await get(classroomRef);

          if (!snapshot.exists()) {
            logger.info(
              "RealtimeClassroomService",
              `Generated classroom code: ${code}`,
            );
            return code;
          }
        } catch (error) {
          // If Firebase fails, fall back to localStorage
          logger.warn(
            "RealtimeClassroomService",
            "Firebase check failed, using fallback",
            error,
          );
          this.fallbackMode = true;

          const existingClassrooms = JSON.parse(
            localStorage.getItem("simulateai_classrooms") || "{}",
          );
          if (!existingClassrooms[code]) {
            return code;
          }
        }
      }

      attempts++;
    }

    throw new Error(
      "Failed to generate unique classroom code after maximum attempts",
    );
  }

  /**
   * Get classroom data by code
   * @param {string} classroomCode - Classroom code
   * @returns {Promise<Object|null>} Classroom data or null if not found
   */
  async getClassroom(classroomCode) {
    try {
      const classroomRef = ref(this.database, `classrooms/${classroomCode}`);
      const snapshot = await get(classroomRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        classroomCode,
        ...snapshot.val(),
      };
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to get classroom",
        error,
      );
      throw error;
    }
  }

  /**
   * Remove a student from classroom roster
   * @param {string} classroomCode - Classroom code
   * @param {string} studentId - Student's Firebase UID
   * @returns {Promise<void>}
   */
  async removeStudent(classroomCode, studentId) {
    try {
      const rosterRef = ref(
        this.database,
        `classrooms/${classroomCode}/roster/${studentId}`,
      );
      await remove(rosterRef);

      logger.info(
        "RealtimeClassroomService",
        "Student removed from classroom",
        {
          classroomCode,
          studentId,
        },
      );
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to remove student",
        error,
      );
      throw error;
    }
  }

  /**
   * Clean up all active listeners
   * @returns {void}
   */
  cleanup() {
    this.listeners.forEach((unsubscribe, listenerId) => {
      try {
        unsubscribe();
        logger.debug(
          "RealtimeClassroomService",
          `Cleaned up listener: ${listenerId}`,
        );
      } catch (error) {
        logger.warn(
          "RealtimeClassroomService",
          `Failed to cleanup listener: ${listenerId}`,
          error,
        );
      }
    });

    this.listeners.clear();
    logger.info("RealtimeClassroomService", "All listeners cleaned up");
  }

  /**
   * Check service health and connection status
   * @returns {Object} Health check results
   */
  healthCheck() {
    return {
      isConnected: this.isConnected,
      hasDatabase: !!this.database,
      activeListeners: this.listeners.size,
      service: "RealtimeClassroomService",
      status: this.isConnected ? "healthy" : "disconnected",
    };
  }
}
