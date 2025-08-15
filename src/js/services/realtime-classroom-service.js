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

    this.initializeDatabase();
  }

  /**
   * Initialize Firebase Realtime Database connection
   * @private
   */
  async initializeDatabase() {
    try {
      if (!this.firebaseService.app) {
        throw new Error("Firebase app not initialized");
      }

      this.database = getDatabase(this.firebaseService.app);
      this.isConnected = true;

      logger.info(
        "RealtimeClassroomService",
        "Database initialized successfully",
      );
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to initialize database",
        error,
      );
      throw error;
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
    if (!this.isConnected) {
      throw new Error("Database not connected");
    }

    try {
      // Generate unique classroom code
      const classroomCode = await this.generateUniqueClassroomCode();

      // Create classroom object
      const classroom = {
        classroomId: `classroom_${Date.now()}`,
        classroomName: classroomData.classroomName,
        instructorId: classroomData.instructorId,
        instructorName: classroomData.instructorName,
        dateCreated: serverTimestamp(),
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

      // Save to database
      const classroomRef = ref(this.database, `classrooms/${classroomCode}`);
      await set(classroomRef, classroom);

      logger.info(
        "RealtimeClassroomService",
        "Classroom created successfully",
        {
          classroomCode,
          instructorId: classroomData.instructorId,
          scenarioCount: classroomData.selectedScenarios.length,
        },
      );

      return {
        classroomCode,
        classroomId: classroom.classroomId,
        ...classroom,
      };
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
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateClassroomCode();

      // Check if code already exists
      const classroomRef = ref(this.database, `classrooms/${code}`);
      const snapshot = await get(classroomRef);

      if (!snapshot.exists()) {
        return code;
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
