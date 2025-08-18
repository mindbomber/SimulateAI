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
  connectDatabaseEmulator,
} from "firebase/database";
import { devConfig } from "../config/firebase-config-dev.js";
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
    this._emulatorConnected = false;

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

      // Ensure we target local emulator in development regardless of databaseURL
      try {
        if (
          !this._emulatorConnected &&
          ["localhost", "127.0.0.1", "::1"].includes(
            window.location.hostname,
          ) &&
          devConfig?.useEmulators
        ) {
          connectDatabaseEmulator(
            this.database,
            devConfig.emulatorHost || "127.0.0.1",
            devConfig.emulatorPorts.database,
          );
          this._emulatorConnected = true;
        }
      } catch (_) {
        // no-op; fall back to configured endpoint
      }

      // Test the connection with a robust operation that avoids special tokens
      try {
        let connectedProbe = false;

        // Prefer a one-time listen on .info/connected; fall back to a safe path GET
        try {
          const infoRef = ref(this.database, ".info/connected");
          await new Promise((resolve, reject) => {
            let unsub = () => {};
            const timer = setTimeout(() => {
              try {
                unsub();
              } catch (_) {
                /* ignore */
              }
              reject(new Error("RTDB info connection probe timeout"));
            }, 2000);

            try {
              // Subscribe once and immediately unsubscribe on first value
              unsub = onValue(
                infoRef,
                () => {
                  clearTimeout(timer);
                  try {
                    unsub();
                  } catch (_) {
                    /* ignore */
                  }
                  connectedProbe = true;
                  resolve(true);
                },
                (err) => {
                  clearTimeout(timer);
                  try {
                    unsub();
                  } catch (_) {
                    /* ignore */
                  }
                  reject(err);
                },
              );
            } catch (e) {
              clearTimeout(timer);
              try {
                unsub();
              } catch (_) {
                /* ignore */
              }
              reject(e);
            }
          });
        } catch (_) {
          // Fall back to a harmless read on a standard path (avoids special token parsing)
          const probeRef = ref(this.database, "health/__connection_check");
          await get(probeRef); // existence not required
          connectedProbe = true;
        }

        if (connectedProbe) {
          this.isConnected = true;
          this.fallbackMode = false;
          logger.info(
            "RealtimeClassroomService",
            "Database initialized successfully with Firebase",
          );
        } else {
          throw new Error("RTDB connection probe failed");
        }
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
    // Do not block on initialization; proceed with hybrid path immediately

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

      // Prefer Firebase if possible; fallback on failure
      // Ensure database exists if app is available
      if (!this.database && this.firebaseService?.app) {
        try {
          this.database = getDatabase(this.firebaseService.app);
        } catch (e) {
          // ignore
        }
      }

      if (this.database) {
        try {
          const result = await Promise.race([
            this.createClassroomFirebase(classroom),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Firebase write timeout (create)")),
                4000,
              ),
            ),
          ]);
          // Mirror to localStorage to allow immediate local listeners to see it
          try {
            const existingClassrooms = JSON.parse(
              localStorage.getItem("simulateai_classrooms") || "{}",
            );
            existingClassrooms[result.classroomCode] = result;
            localStorage.setItem(
              "simulateai_classrooms",
              JSON.stringify(existingClassrooms),
            );
          } catch (_) {
            /* ignore */
          }
          // Broadcast to other tabs so students in fallback can discover it
          this.broadcastClassroom(result);
          return result;
        } catch (e) {
          logger.warn(
            "RealtimeClassroomService",
            "Firebase create failed or timed out; using fallback",
            e,
          );
          const created = await this.createClassroomFallback(classroom);
          this.broadcastClassroom(created);
          // Best-effort background publish to Firebase when possible
          this.publishClassroomToFirebaseIfPossible(created).catch((err) =>
            logger.warn(
              "RealtimeClassroomService",
              "Background publish to Firebase failed",
              err,
            ),
          );
          return created;
        }
      }

      // No database—fallback
      const created = await this.createClassroomFallback(classroom);
      this.broadcastClassroom(created);
      // Best-effort background publish to Firebase when possible
      this.publishClassroomToFirebaseIfPossible(created).catch((err) =>
        logger.warn(
          "RealtimeClassroomService",
          "Background publish to Firebase failed",
          err,
        ),
      );
      return created;
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

    // Mirror to localStorage so fallback-mode students can still find the classroom
    try {
      const existingClassrooms = JSON.parse(
        localStorage.getItem("simulateai_classrooms") || "{}",
      );
      if (!existingClassrooms[classroom.classroomCode]) {
        existingClassrooms[classroom.classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );
        logger.debug(
          "RealtimeClassroomService",
          "Mirrored classroom to fallback store",
          { classroomCode: classroom.classroomCode },
        );
      }
    } catch (mirrorError) {
      logger.warn(
        "RealtimeClassroomService",
        "Failed to mirror classroom to fallback store",
        mirrorError,
      );
    }

    return classroom;
  }

  /**
   * Attempt to publish a locally-created classroom to Firebase in the background
   * This helps cross-device discovery when initial creation used fallback mode
   * @private
   */
  async publishClassroomToFirebaseIfPossible(classroom) {
    try {
      if (!this.firebaseService?.app) return;
      // Ensure db exists
      if (!this.database) {
        try {
          this.database = getDatabase(this.firebaseService.app);
        } catch (_) {
          return; // Can't initialize db
        }
      }

      if (!this.database) return;

      const classroomRef = ref(
        this.database,
        `classrooms/${classroom.classroomCode}`,
      );

      // If already exists, skip
      let exists = false;
      try {
        const snapshot = await Promise.race([
          get(classroomRef),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Firebase read timeout (publish check)")),
              3000,
            ),
          ),
        ]);
        exists = snapshot.exists();
      } catch (_) {
        // Read failed; proceed with best-effort write
      }

      if (!exists) {
        await Promise.race([
          set(classroomRef, {
            ...classroom,
            dateCreated: classroom.dateCreated || serverTimestamp(),
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Firebase write timeout (publish)")),
              3000,
            ),
          ),
        ]);
        logger.info(
          "RealtimeClassroomService",
          "Published fallback-created classroom to Firebase",
          { classroomCode: classroom.classroomCode },
        );
      }
    } catch (error) {
      // Swallow; best-effort background task
      logger.debug(
        "RealtimeClassroomService",
        "Publish to Firebase skipped/failed",
        error,
      );
    }
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
    // Do not block on initialization; attempt hybrid immediately

    try {
      // Validate classroom code format
      if (!validateClassroomCode(classroomCode)) {
        throw new Error("Invalid classroom code format");
      }
      // Try Firebase first if available; otherwise fallback
      let classroom = null;
      let usingFirebase = false;

      // If we don't have a database yet but app exists, try to create one
      if (!this.database && this.firebaseService?.app) {
        try {
          this.database = getDatabase(this.firebaseService.app);
        } catch (e) {
          // ignore; we'll rely on fallback
        }
      }

      if (this.database) {
        try {
          const classroomRef = ref(
            this.database,
            `classrooms/${classroomCode}`,
          );
          const snapshot = await Promise.race([
            get(classroomRef),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Firebase read timeout (join)")),
                5000,
              ),
            ),
          ]);
          if (snapshot.exists()) {
            classroom = snapshot.val();
            usingFirebase = true;
          }
        } catch (e) {
          logger.warn(
            "RealtimeClassroomService",
            "Firebase read failed during join; will try fallback",
            e,
          );
        }
      }

      // If not found via Firebase, check localStorage fallback
      if (!classroom) {
        try {
          const existingClassrooms = JSON.parse(
            localStorage.getItem("simulateai_classrooms") || "{}",
          );
          classroom = existingClassrooms[classroomCode] || null;
        } catch (e) {
          // ignore
        }

        // Edge-case: teacher created via Firebase but local student is offline and
        // localStorage doesn’t have the classroom yet. Make a one-time best-effort
        // attempt to mirror from Firebase to localStorage, then retry lookup.
        if (!classroom && this.database) {
          try {
            const classroomRef = ref(
              this.database,
              `classrooms/${classroomCode}`,
            );
            const snapshot = await Promise.race([
              get(classroomRef),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Firebase read timeout (mirror)")),
                  2500,
                ),
              ),
            ]);
            if (snapshot.exists()) {
              const fbClassroom = snapshot.val();
              try {
                const existing = JSON.parse(
                  localStorage.getItem("simulateai_classrooms") || "{}",
                );
                existing[classroomCode] = fbClassroom;
                localStorage.setItem(
                  "simulateai_classrooms",
                  JSON.stringify(existing),
                );
                classroom = fbClassroom;
              } catch (_) {
                // ignore
              }
            }
          } catch (_) {
            // ignore
          }
        }

        // Final small window: listen for a BroadcastChannel announce from teacher tab
        if (!classroom && typeof BroadcastChannel !== "undefined") {
          classroom = await new Promise((resolve) => {
            let resolved = false;
            try {
              const bc = new BroadcastChannel("simulateai_classrooms");
              const waitMs = 2500;
              const timer = setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  try {
                    bc.close();
                  } catch (closeErr) {
                    logger.debug(
                      "RealtimeClassroomService",
                      "BC close timeout error",
                      closeErr,
                    );
                  }
                  resolve(null);
                }
              }, waitMs);
              bc.onmessage = (evt) => {
                const data = evt?.data;
                if (
                  data?.type === "classroom_created" &&
                  data?.classroom?.classroomCode === classroomCode
                ) {
                  try {
                    const existing = JSON.parse(
                      localStorage.getItem("simulateai_classrooms") || "{}",
                    );
                    existing[classroomCode] = data.classroom;
                    localStorage.setItem(
                      "simulateai_classrooms",
                      JSON.stringify(existing),
                    );
                  } catch (storeErr) {
                    logger.debug(
                      "RealtimeClassroomService",
                      "Broadcast mirror store error",
                      storeErr,
                    );
                  }
                  if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    try {
                      bc.close();
                    } catch (closeErr) {
                      logger.debug(
                        "RealtimeClassroomService",
                        "BC close message error",
                        closeErr,
                      );
                    }
                    resolve(data.classroom);
                  }
                }
              };
            } catch (err) {
              logger.debug(
                "RealtimeClassroomService",
                "BroadcastChannel unsupported/error",
                err,
              );
              resolve(null);
            }
          });
        }
      }

      if (!classroom) {
        throw new Error("Classroom not found");
      }

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
      if (classroom.roster && classroom.roster[studentId]) {
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

      if (usingFirebase) {
        const rosterRef = ref(
          this.database,
          `classrooms/${classroomCode}/roster/${studentId}`,
        );
        try {
          await Promise.race([
            set(rosterRef, studentInfo),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Firebase write timeout (roster)")),
                3000,
              ),
            ),
          ]);
          // Notify other tabs promptly with student payload
          // Use a plain object for broadcast to avoid serverTimestamp serialization issues
          this.broadcastRosterUpdate(classroomCode, {
            studentId,
            studentInfo: {
              nickname,
              joinedAt: Date.now(),
              isActive: true,
              lastSeen: Date.now(),
            },
          });
          // Mirror to localStorage for same-profile consumers (teacher panel)
          try {
            const store = JSON.parse(
              localStorage.getItem("simulateai_classrooms") || "{}",
            );
            const cls = store[classroomCode] || classroom || { classroomCode };
            cls.roster = cls.roster || {};
            cls.roster[studentId] = {
              nickname,
              joinedAt: Date.now(),
              isActive: true,
              lastSeen: Date.now(),
            };
            store[classroomCode] = cls;
            localStorage.setItem(
              "simulateai_classrooms",
              JSON.stringify(store),
            );
          } catch (_) {
            /* ignore */
          }
        } catch (e) {
          logger.warn(
            "RealtimeClassroomService",
            "Firebase roster write failed; falling back",
            e,
          );
          // Seed localStorage with classroom so fallback can proceed
          try {
            const existingClassrooms = JSON.parse(
              localStorage.getItem("simulateai_classrooms") || "{}",
            );
            if (!existingClassrooms[classroomCode]) {
              existingClassrooms[classroomCode] = classroom;
              localStorage.setItem(
                "simulateai_classrooms",
                JSON.stringify(existingClassrooms),
              );
            }
          } catch (_) {
            // ignore
          }
          return await this.joinClassroomFallback(
            classroomCode,
            studentId,
            nickname,
          );
        }

        // Initialize student choices structure
        const choicesRef = ref(
          this.database,
          `classrooms/${classroomCode}/studentChoices/${studentId}`,
        );
        try {
          await Promise.race([
            set(choicesRef, {
              scenarios: {},
              overallProgress: {
                completed: 0,
                total: classroom.selectedScenarios.length,
                currentScenario: null,
              },
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Firebase write timeout (choices)")),
                3000,
              ),
            ),
          ]);
        } catch (e) {
          logger.warn(
            "RealtimeClassroomService",
            "Firebase choices write failed; falling back",
            e,
          );
          // Seed and fallback
          try {
            const existingClassrooms = JSON.parse(
              localStorage.getItem("simulateai_classrooms") || "{}",
            );
            if (!existingClassrooms[classroomCode]) {
              existingClassrooms[classroomCode] = classroom;
              localStorage.setItem(
                "simulateai_classrooms",
                JSON.stringify(existingClassrooms),
              );
            }
          } catch (_) {
            // ignore
          }
          return await this.joinClassroomFallback(
            classroomCode,
            studentId,
            nickname,
          );
        }
      } else {
        // Use fallback write path
        const result = await this.joinClassroomFallback(
          classroomCode,
          studentId,
          nickname,
        );
        // Notify other tabs promptly with student payload
        this.broadcastRosterUpdate(classroomCode, {
          studentId,
          studentInfo: result.studentInfo,
        });
        // Best-effort background publish to Firebase for cross-profile discovery
        this.publishRosterEntryToFirebaseIfPossible(
          classroomCode,
          studentId,
          result.studentInfo,
        ).catch(() => {});
        return result;
      }

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
   * Broadcast classroom creation so other tabs (student) can discover it immediately
   * @private
   */
  broadcastClassroom(classroom) {
    try {
      if (typeof BroadcastChannel === "undefined") return;
      const bc = new BroadcastChannel("simulateai_classrooms");
      bc.postMessage({ type: "classroom_created", classroom });
      // Close shortly to avoid keeping channel open
      setTimeout(() => {
        try {
          bc.close();
        } catch (e) {
          logger.debug(
            "RealtimeClassroomService",
            "BC close deferred error",
            e,
          );
        }
      }, 100);
    } catch (e) {
      // Best effort only
    }
  }

  /**
   * Best-effort background publish of a roster entry to Firebase when fallback was used
   * @private
   * @param {string} classroomCode
   * @param {string} studentId
   * @param {Object} studentInfo
   */
  async publishRosterEntryToFirebaseIfPossible(
    classroomCode,
    studentId,
    studentInfo,
  ) {
    try {
      if (!this.firebaseService?.app) return;
      if (!this.database) {
        try {
          this.database = getDatabase(this.firebaseService.app);
        } catch (_) {
          return;
        }
      }
      if (!this.database) return;

      const rosterRef = ref(
        this.database,
        `classrooms/${classroomCode}/roster/${studentId}`,
      );
      await Promise.race([
        set(rosterRef, studentInfo),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Firebase write timeout (roster publish)")),
            3000,
          ),
        ),
      ]);
    } catch (e) {
      // best-effort only
    }
  }

  /**
   * Broadcast a roster update so other tabs (e.g., teacher) refresh immediately
   * @private
   * @param {string} classroomCode
   */
  broadcastRosterUpdate(classroomCode, payload = null) {
    try {
      if (typeof BroadcastChannel === "undefined") return;
      const bc = new BroadcastChannel("simulateai_classrooms");
      bc.postMessage({ type: "roster_updated", classroomCode, payload });
      setTimeout(() => {
        try {
          bc.close();
        } catch (e) {
          logger.debug(
            "RealtimeClassroomService",
            "BC close deferred error",
            e,
          );
        }
      }, 100);
    } catch (_) {
      // Best-effort only
    }
  }

  /**
   * Join a classroom using localStorage fallback
   * @private
   */
  async joinClassroomFallback(classroomCode, studentId, nickname) {
    try {
      // Validate classroom code format
      if (!validateClassroomCode(classroomCode)) {
        throw new Error("Invalid classroom code format");
      }

      const existingClassrooms = JSON.parse(
        localStorage.getItem("simulateai_classrooms") || "{}",
      );

      const classroom = existingClassrooms[classroomCode];
      if (!classroom) {
        throw new Error("Classroom not found");
      }

      // Late join and capacity checks
      if (
        classroom.sessionStatus?.isLive &&
        !classroom.settings?.allowLateJoining
      ) {
        throw new Error("Session is live and not accepting new students");
      }

      const roster = classroom.roster || {};
      const currentRosterSize = Object.keys(roster).length;
      const maxStudents =
        classroom.settings?.maxStudents || CLASSROOM_CONSTANTS.MAX_STUDENTS;
      if (currentRosterSize >= maxStudents) {
        throw new Error("Classroom is full");
      }

      // If already joined, return existing
      if (roster[studentId]) {
        logger.warn(
          "RealtimeClassroomService",
          "Student already in classroom (fallback)",
          {
            classroomCode,
            studentId,
          },
        );
        return {
          classroomCode,
          ...classroom,
          studentInfo: roster[studentId],
        };
      }

      // Add student
      const now = Date.now();
      const studentInfo = {
        nickname,
        joinedAt: now,
        isActive: true,
        lastSeen: now,
      };

      classroom.roster = { ...roster, [studentId]: studentInfo };

      // Initialize student choices
      classroom.studentChoices = classroom.studentChoices || {};
      classroom.studentChoices[studentId] = {
        scenarios: {},
        overallProgress: {
          completed: 0,
          total: (classroom.selectedScenarios || []).length,
          currentScenario: null,
          lastUpdated: now,
        },
      };

      // Persist
      existingClassrooms[classroomCode] = classroom;
      localStorage.setItem(
        "simulateai_classrooms",
        JSON.stringify(existingClassrooms),
      );

      logger.info(
        "RealtimeClassroomService",
        "Student joined classroom (fallback)",
        { classroomCode, studentId, nickname },
      );

      return {
        classroomCode,
        ...classroom,
        studentInfo,
      };
    } catch (error) {
      logger.error(
        "RealtimeClassroomService",
        "Failed to join classroom in fallback mode",
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
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        if (!classroom) throw new Error("Classroom not found");

        classroom.sessionStatus = {
          isLive: true,
          isPaused: false,
          currentScenario: 0,
          startTime: Date.now(),
          completedAt: null,
        };
        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );

        // Notify same-profile tabs immediately
        try {
          this.broadcastSessionStatusUpdate(
            classroomCode,
            classroom.sessionStatus,
          );
        } catch (e) {
          // best-effort notify failure
        }

        logger.info(
          "RealtimeClassroomService",
          "Live session started (fallback)",
          {
            classroomCode,
            instructorId,
          },
        );
        return;
      }
      const sessionStatusRef = ref(
        this.database,
        `classrooms/${classroomCode}/sessionStatus`,
      );

      // Attempt Firebase write with timeout; on timeout, fall back to local strategy
      try {
        await Promise.race([
          set(sessionStatusRef, {
            isLive: true,
            isPaused: false,
            currentScenario: 0,
            startTime: serverTimestamp(),
            completedAt: null,
          }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Firebase write timeout (start session)")),
              4000,
            ),
          ),
        ]);

        logger.info("RealtimeClassroomService", "Live session started", {
          classroomCode,
          instructorId,
        });
      } catch (err) {
        logger.warn(
          "RealtimeClassroomService",
          "Firebase write failed/timed out for startLiveSession; applying fallback locally",
          err,
        );

        // Local mirror fallback so same-profile students update immediately
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode] || {};
        const status = {
          isLive: true,
          isPaused: false,
          currentScenario: 0,
          startTime: Date.now(),
          completedAt: null,
        };
        classroom.sessionStatus = status;
        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );

        try {
          this.broadcastSessionStatusUpdate(classroomCode, status);
        } catch (_) {
          // best-effort: BroadcastChannel may be unavailable
        }

        // Best-effort background publish to Firebase (no await)
        try {
          set(sessionStatusRef, {
            isLive: true,
            isPaused: false,
            currentScenario: 0,
            startTime: serverTimestamp(),
            completedAt: null,
          }).catch(() => {});
        } catch (_) {
          // ignore background publish errors
        }
      }
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
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        if (!classroom) throw new Error("Classroom not found");
        classroom.sessionStatus = classroom.sessionStatus || {};
        classroom.sessionStatus.isPaused = isPaused;
        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );
        logger.info(
          "RealtimeClassroomService",
          `Session ${isPaused ? "paused" : "resumed"} (fallback)`,
          { classroomCode },
        );
        return;
      }
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
   * Broadcast session status update to same-profile tabs
   * @param {string} classroomCode
   * @param {Object} status
   */
  broadcastSessionStatusUpdate(classroomCode, status) {
    if (typeof BroadcastChannel === "undefined") return;
    try {
      const bc = new BroadcastChannel("simulateai_classrooms");
      bc.postMessage({
        type: "session_status_updated",
        classroomCode,
        status,
      });
      // Close shortly to avoid keeping channel open
      setTimeout(() => {
        try {
          bc.close();
        } catch (_) {
          // ignore close errors
        }
      }, 150);
    } catch (_) {
      // ignore broadcast errors
    }
  }

  /**
   * Complete a classroom session
   * @param {string} classroomCode - Classroom code
   * @returns {Promise<void>}
   */
  async completeSession(classroomCode) {
    try {
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        if (!classroom) throw new Error("Classroom not found");
        classroom.sessionStatus = {
          isLive: false,
          isPaused: false,
          currentScenario: null,
          startTime: null,
          completedAt: Date.now(),
        };
        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );
        logger.info(
          "RealtimeClassroomService",
          "Session completed (fallback)",
          {
            classroomCode,
          },
        );
        return;
      }
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
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        if (!classroom) throw new Error("Classroom not found");

        const now = Date.now();
        const choiceData = {
          choice,
          timestamp: now,
          isComplete: true,
          responseTime: metadata.responseTime || null,
          confidence: metadata.confidence || null,
        };

        classroom.studentChoices = classroom.studentChoices || {};
        const student = classroom.studentChoices[studentId] || {
          scenarios: {},
          overallProgress: {
            completed: 0,
            total: (classroom.selectedScenarios || []).length,
            currentScenario: null,
            lastUpdated: now,
          },
        };
        student.scenarios = { ...student.scenarios, [scenarioId]: choiceData };
        classroom.studentChoices[studentId] = student;

        // Update progress
        await this.updateStudentProgress(classroomCode, studentId, scenarioId);

        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );

        // Broadcast a same-profile choice update for immediate teacher UI refresh
        try {
          this.broadcastChoiceUpdate(classroomCode, {
            studentId,
            scenarioId,
            choiceData,
          });
        } catch (_) {
          // best-effort only
        }

        logger.info(
          "RealtimeClassroomService",
          "Student choice submitted (fallback)",
          { classroomCode, studentId, scenarioId, choice },
        );
        return;
      }
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

      // Mirror minimal update to localStorage to speed up same-profile listeners
      try {
        const existing = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const cls = existing[classroomCode] || {};
        cls.studentChoices = cls.studentChoices || {};
        const student = cls.studentChoices[studentId] || { scenarios: {} };
        student.scenarios = {
          ...(student.scenarios || {}),
          [scenarioId]: { ...choiceData, timestamp: Date.now() },
        };
        cls.studentChoices[studentId] = student;
        existing[classroomCode] = cls;
        localStorage.setItem("simulateai_classrooms", JSON.stringify(existing));
      } catch (_) {
        // ignore mirror errors
      }

      // Broadcast for same-profile immediate UI updates
      try {
        this.broadcastChoiceUpdate(classroomCode, {
          studentId,
          scenarioId,
          // send a plain object (no serverTimestamp)
          choiceData: {
            choice,
            timestamp: Date.now(),
            isComplete: true,
            responseTime: metadata.responseTime || null,
            confidence: metadata.confidence || null,
          },
        });
      } catch (_) {
        // best-effort only
      }

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
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        if (!classroom) throw new Error("Classroom not found");

        const scenarios =
          classroom.studentChoices?.[studentId]?.scenarios || {};
        const completed = Object.keys(scenarios).length;
        const total = (classroom.selectedScenarios || []).length;

        classroom.studentChoices = classroom.studentChoices || {};
        classroom.studentChoices[studentId] =
          classroom.studentChoices[studentId] || {};
        classroom.studentChoices[studentId].overallProgress = {
          completed,
          total,
          currentScenario: currentScenarioId,
          lastUpdated: Date.now(),
        };

        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );
        return;
      }
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
    const listenerId = `roster_${classroomCode}`;

    // Combined strategy: localStorage polling + BroadcastChannel + Firebase onValue + Firebase periodic GET
    let lastJson = "";
    const emit = (roster) => {
      try {
        const j = JSON.stringify(roster || {});
        if (j !== lastJson) {
          lastJson = j;
          callback(roster || {});
        }
      } catch (_) {
        callback(roster || {});
      }
    };

    const cleanups = [];

    // Local polling always on as safety net
    const pollId = setInterval(() => {
      try {
        const existing = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const cls = existing[classroomCode] || {};
        emit(cls.roster || {});
      } catch (e) {
        logger.debug("RealtimeClassroomService", "Roster poll failed", e);
      }
    }, 1000);
    cleanups.push(() => clearInterval(pollId));

    // BroadcastChannel merge for cross-tab same-profile
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("simulateai_classrooms");
        const onMsg = (evt) => {
          try {
            if (
              evt?.data?.type === "roster_updated" &&
              evt.data.classroomCode === classroomCode
            ) {
              const existing = JSON.parse(
                localStorage.getItem("simulateai_classrooms") || "{}",
              );
              const cls = existing[classroomCode] || {};
              const payload = evt.data.payload;
              if (payload && payload.studentId && payload.studentInfo) {
                cls.roster = cls.roster || {};
                cls.roster[payload.studentId] = payload.studentInfo;
                existing[classroomCode] = cls;
                try {
                  localStorage.setItem(
                    "simulateai_classrooms",
                    JSON.stringify(existing),
                  );
                } catch (_) {
                  /* ignore */
                }
              }
              emit((existing[classroomCode] || {}).roster || {});
            }
          } catch (e) {
            logger.debug("RealtimeClassroomService", "BC roster msg error", e);
          }
        };
        bc.addEventListener("message", onMsg);
        cleanups.push(() => {
          try {
            bc.removeEventListener("message", onMsg);
            bc.close();
          } catch (_) {
            /* ignore */
          }
        });
      }
    } catch (_) {
      /* ignore */
    }

    // Firebase listeners (if available)
    if (this.database) {
      try {
        const rosterRef = ref(
          this.database,
          `classrooms/${classroomCode}/roster`,
        );
        const unsubscribe = onValue(rosterRef, (snapshot) => {
          emit(snapshot.val() || {});
        });
        cleanups.push(() => unsubscribe());

        // Periodic GET to mirror into localStorage for cross-profile scenarios
        const fbPollId = setInterval(async () => {
          try {
            const snap = await Promise.race([
              get(rosterRef),
              new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(new Error("Firebase read timeout (roster poll)")),
                  3000,
                ),
              ),
            ]);
            const data =
              typeof snap?.val === "function" ? snap.val() : snap?.val || {};
            const roster = data && typeof data === "object" ? data : {};
            if (Object.keys(roster).length > 0) {
              try {
                const existing = JSON.parse(
                  localStorage.getItem("simulateai_classrooms") || "{}",
                );
                const cls = existing[classroomCode] || {};
                cls.roster = { ...(cls.roster || {}), ...roster };
                existing[classroomCode] = cls;
                localStorage.setItem(
                  "simulateai_classrooms",
                  JSON.stringify(existing),
                );
              } catch (_) {
                /* ignore */
              }
              emit(roster);
            }
          } catch (_) {
            /* ignore */
          }
        }, 3500);
        cleanups.push(() => clearInterval(fbPollId));
      } catch (e) {
        logger.debug(
          "RealtimeClassroomService",
          "Firebase roster listen failed",
          e,
        );
      }
    }

    // If Firebase DB wasn't ready at subscription time, set a short retry to attach once available
    if (!this.database && this.firebaseService?.app) {
      const attachWhenReady = async () => {
        try {
          if (!this.database && this.firebaseService?.app) {
            this.database = getDatabase(this.firebaseService.app);
          }
          if (this.database) {
            const rosterRef = ref(
              this.database,
              `classrooms/${classroomCode}/roster`,
            );
            const unsubscribe = onValue(rosterRef, (snapshot) => {
              emit(snapshot.val() || {});
            });
            cleanups.push(() => unsubscribe());
            return true;
          }
        } catch (_) {
          // ignore and retry
        }
        return false;
      };
      const retryId = setInterval(async () => {
        const attached = await attachWhenReady();
        if (attached) {
          clearInterval(retryId);
        }
      }, 1000);
      cleanups.push(() => clearInterval(retryId));
    }

    this.listeners.set(listenerId, () => cleanups.forEach((fn) => fn && fn()));
    return () => {
      const unsub = this.listeners.get(listenerId);
      if (unsub) unsub();
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
    const listenerId = `status_${classroomCode}`;

    // Hybrid strategy: localStorage polling + BroadcastChannel + Firebase onValue + periodic Firebase GET
    let lastJson = "";
    const emit = (status) => {
      try {
        const j = JSON.stringify(status || {});
        if (j !== lastJson) {
          lastJson = j;
          callback(status || {});
        }
      } catch (e) {
        callback(status || {});
      }
    };

    const cleanups = [];

    // LocalStorage poll (always on for fast local updates)
    const pollId = setInterval(() => {
      try {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode] || {};
        emit(classroom.sessionStatus || {});
      } catch (e) {
        logger.warn("RealtimeClassroomService", "Status poll failed", e);
      }
    }, 1000);
    cleanups.push(() => clearInterval(pollId));

    // BroadcastChannel merge for same-profile tabs
    if (typeof BroadcastChannel !== "undefined") {
      try {
        const bc = new BroadcastChannel("simulateai_classrooms");
        const handler = (event) => {
          const data = event?.data;
          if (
            data?.type === "session_status_updated" &&
            data?.classroomCode === classroomCode &&
            data?.status
          ) {
            // Mirror into localStorage
            try {
              const existingClassrooms = JSON.parse(
                localStorage.getItem("simulateai_classrooms") || "{}",
              );
              const classroom = existingClassrooms[classroomCode] || {};
              classroom.sessionStatus = data.status;
              existingClassrooms[classroomCode] = classroom;
              localStorage.setItem(
                "simulateai_classrooms",
                JSON.stringify(existingClassrooms),
              );
            } catch (_) {
              // ignore localStorage mirror errors
            }
            emit(data.status);
          }
        };
        bc.addEventListener("message", handler);
        cleanups.push(() => {
          try {
            bc.removeEventListener("message", handler);
            bc.close();
          } catch (_) {
            // ignore BroadcastChannel cleanup errors
          }
        });
      } catch (e) {
        logger.warn(
          "RealtimeClassroomService",
          "BroadcastChannel unsupported/error (status)",
          e,
        );
      }
    }

    if (this.database) {
      // Firebase onValue listener
      const statusRef = ref(
        this.database,
        `classrooms/${classroomCode}/sessionStatus`,
      );
      try {
        const unsubscribe = onValue(statusRef, (snapshot) => {
          const status = snapshot.val() || {};
          // Mirror to localStorage for local consumers
          try {
            const existingClassrooms = JSON.parse(
              localStorage.getItem("simulateai_classrooms") || "{}",
            );
            const classroom = existingClassrooms[classroomCode] || {};
            classroom.sessionStatus = status;
            existingClassrooms[classroomCode] = classroom;
            localStorage.setItem(
              "simulateai_classrooms",
              JSON.stringify(existingClassrooms),
            );
          } catch (_) {
            // ignore localStorage mirror errors
          }
          emit(status);
        });
        cleanups.push(() => unsubscribe());
      } catch (e) {
        logger.warn(
          "RealtimeClassroomService",
          "onValue listener failed for session status",
          e,
        );
      }

      // Periodic Firebase GET mirror (covers cases where onValue is blocked)
      const periodicId = setInterval(async () => {
        try {
          const snapshot = await Promise.race([
            get(statusRef),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Firebase read timeout (status poll)")),
                3500,
              ),
            ),
          ]);
          if (snapshot && snapshot.exists()) {
            const status = snapshot.val() || {};
            try {
              const existingClassrooms = JSON.parse(
                localStorage.getItem("simulateai_classrooms") || "{}",
              );
              const classroom = existingClassrooms[classroomCode] || {};
              classroom.sessionStatus = status;
              existingClassrooms[classroomCode] = classroom;
              localStorage.setItem(
                "simulateai_classrooms",
                JSON.stringify(existingClassrooms),
              );
            } catch (_) {
              // ignore localStorage mirror errors
            }
            emit(status);
          }
        } catch (e) {
          // Network instability; ignore
        }
      }, 3500);
      cleanups.push(() => clearInterval(periodicId));
    }

    this.listeners.set(listenerId, () => cleanups.forEach((fn) => fn && fn()));
    return () => {
      const unsub = this.listeners.get(listenerId);
      if (unsub) unsub();
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
    const listenerId = `choices_${classroomCode}`;

    // We'll combine sources: Firebase (if available), localStorage polling, and BroadcastChannel merges.
    let lastJson = "";

    const emit = (choices) => {
      try {
        const j = JSON.stringify(choices || {});
        if (j !== lastJson) {
          lastJson = j;
          callback(choices || {});
        }
      } catch (e) {
        callback(choices || {});
      }
    };

    const cleanups = [];

    // Local polling always active as safety net
    const intervalId = setInterval(() => {
      try {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode] || {};
        emit(classroom.studentChoices || {});
      } catch (e) {
        logger.debug("RealtimeClassroomService", "Choices poll failed", e);
      }
    }, 1200);
    cleanups.push(() => clearInterval(intervalId));

    // BroadcastChannel merge for same-profile immediate updates
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("simulateai_classrooms");
        const onMsg = (evt) => {
          try {
            const data = evt?.data;
            if (
              data?.type === "student_choice_updated" &&
              data?.classroomCode === classroomCode
            ) {
              // Merge into local mirror and emit
              const existing = JSON.parse(
                localStorage.getItem("simulateai_classrooms") || "{}",
              );
              const cls = existing[classroomCode] || {};
              cls.studentChoices = cls.studentChoices || {};
              const sid = data.payload?.studentId;
              const scn = data.payload?.scenarioId;
              const cdata = data.payload?.choiceData || {};
              const student = cls.studentChoices[sid] || { scenarios: {} };
              student.scenarios = {
                ...(student.scenarios || {}),
                [scn]: cdata,
              };
              cls.studentChoices[sid] = student;
              existing[classroomCode] = cls;
              try {
                localStorage.setItem(
                  "simulateai_classrooms",
                  JSON.stringify(existing),
                );
              } catch (_) {
                // ignore
              }
              emit(cls.studentChoices || {});
            }
          } catch (e) {
            logger.debug("RealtimeClassroomService", "BC choices msg error", e);
          }
        };
        bc.addEventListener("message", onMsg);
        cleanups.push(() => {
          try {
            bc.removeEventListener("message", onMsg);
            bc.close();
          } catch (_) {
            // ignore
          }
        });
      }
    } catch (_) {
      // ignore
    }

    // Firebase listener if available
    if (this.database) {
      try {
        const choicesRef = ref(
          this.database,
          `classrooms/${classroomCode}/studentChoices`,
        );
        const unsubscribe = onValue(choicesRef, (snapshot) => {
          const data = snapshot.val() || {};
          // Mirror to localStorage for faster same-profile access
          try {
            const existing = JSON.parse(
              localStorage.getItem("simulateai_classrooms") || "{}",
            );
            const cls = existing[classroomCode] || {};
            cls.studentChoices = data || {};
            existing[classroomCode] = cls;
            localStorage.setItem(
              "simulateai_classrooms",
              JSON.stringify(existing),
            );
          } catch (_) {
            // ignore
          }
          emit(data);
        });
        cleanups.push(() => unsubscribe());

        // Periodic GET as a safety net
        const fbPollId = setInterval(async () => {
          try {
            const snap = await Promise.race([
              get(choicesRef),
              new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(new Error("Firebase read timeout (choices poll)")),
                  3500,
                ),
              ),
            ]);
            const data =
              typeof snap?.val === "function" ? snap.val() : snap?.val || {};
            if (data && typeof data === "object") {
              try {
                const existing = JSON.parse(
                  localStorage.getItem("simulateai_classrooms") || "{}",
                );
                const cls = existing[classroomCode] || {};
                cls.studentChoices = data || {};
                existing[classroomCode] = cls;
                localStorage.setItem(
                  "simulateai_classrooms",
                  JSON.stringify(existing),
                );
              } catch (_) {
                // ignore
              }
              emit(data);
            }
          } catch (_) {
            // ignore
          }
        }, 4000);
        cleanups.push(() => clearInterval(fbPollId));
      } catch (e) {
        logger.debug(
          "RealtimeClassroomService",
          "Firebase choices listen failed",
          e,
        );
      }
    }

    this.listeners.set(listenerId, () => cleanups.forEach((fn) => fn && fn()));
    return () => {
      const unsub = this.listeners.get(listenerId);
      if (unsub) unsub();
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Broadcast a student choice update to same-profile tabs
   * @private
   * @param {string} classroomCode
   * @param {{studentId:string,scenarioId:string,choiceData:Object}} payload
   */
  broadcastChoiceUpdate(classroomCode, payload) {
    try {
      if (typeof BroadcastChannel === "undefined") return;
      const bc = new BroadcastChannel("simulateai_classrooms");
      bc.postMessage({
        type: "student_choice_updated",
        classroomCode,
        payload,
      });
      setTimeout(() => {
        try {
          bc.close();
        } catch (_) {
          // ignore
        }
      }, 100);
    } catch (_) {
      // best-effort only
    }
  }

  /**
   * Generate a unique classroom code
   * @private
   * @returns {Promise<string>} Unique 6-character classroom code
   */
  async generateUniqueClassroomCode() {
    // Do not block on initialization; proceed hybrid immediately

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateClassroomCode();

      // Prefer Firebase if database is available; else use fallback
      if (!this.database && this.firebaseService?.app) {
        try {
          this.database = getDatabase(this.firebaseService.app);
        } catch (e) {
          // ignore
        }
      }

      if (!this.database) {
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
          const snapshot = await Promise.race([
            get(classroomRef),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Firebase read timeout (code check)")),
                3000,
              ),
            ),
          ]);

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
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        return classroom ? { classroomCode, ...classroom } : null;
      }

      const classroomRef = ref(this.database, `classrooms/${classroomCode}`);
      const snapshot = await get(classroomRef);
      if (!snapshot.exists()) return null;
      return { classroomCode, ...snapshot.val() };
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
      if (this.fallbackMode || !this.database) {
        const existingClassrooms = JSON.parse(
          localStorage.getItem("simulateai_classrooms") || "{}",
        );
        const classroom = existingClassrooms[classroomCode];
        if (!classroom) throw new Error("Classroom not found");
        if (classroom.roster && classroom.roster[studentId]) {
          delete classroom.roster[studentId];
        }
        if (classroom.studentChoices && classroom.studentChoices[studentId]) {
          delete classroom.studentChoices[studentId];
        }
        existingClassrooms[classroomCode] = classroom;
        localStorage.setItem(
          "simulateai_classrooms",
          JSON.stringify(existingClassrooms),
        );

        logger.info(
          "RealtimeClassroomService",
          "Student removed from classroom (fallback)",
          { classroomCode, studentId },
        );
        return;
      }
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
