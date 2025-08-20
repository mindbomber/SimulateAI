/**
 * Student Classroom Modal Components
 * Handles student-side classroom joining, waiting room, and session participation
 * @class StudentClassroomModals
 * @author SimulateAI Development Team
 * @since 1.80.0
 */

import ModalUtility from "./modal-utility.js";
import RealtimeClassroomService from "../services/realtime-classroom-service.js";
import { CLASSROOM_CONSTANTS } from "../constants/classroom-constants.js";
import {
  validateClassroomCode,
  validateNickname,
  formatClassroomCode,
  logClassroomEvent,
} from "../utils/classroom-utils.js";
import logger from "../utils/logger.js";
import SCENARIO_MODES from "../constants/scenario-modes.js";

export default class StudentClassroomModals {
  constructor(dataHandler, firebaseService) {
    this.dataHandler = dataHandler;
    this.firebaseService = firebaseService;
    this.classroomService = new RealtimeClassroomService(firebaseService);

    // State management
    this.currentClassroom = null;
    this.currentStudent = null;
    this.sessionStatus = null;
    this.studentProgress = null;
    this.activeListeners = [];

    // Modal instances
    this.joinClassroomModal = null;
    this.waitingRoomModal = null;
    this.finalChoicesModal = null;

    this.initialized = false;

    // Internal flag to distinguish intentional programmatic closes
    // (e.g., starting session) from user-initiated closes (leaving)
    this._suppressWaitingRoomClose = false;

    // Track latest reflection completion to coordinate final summary
    this._latestReflectionCompleted = null;
  }

  /**
   * Initialize student classroom modals
   * @param {boolean} isGuestMode - Whether initializing in guest mode
   */
  async initialize(isGuestMode = false) {
    if (this.initialized) return;

    try {
      // Get current user as student (or use guest mode)
      if (isGuestMode) {
        // Create a temporary guest student object
        this.currentStudent = {
          uid: `guest_student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          displayName: "Guest Student",
          email: null,
          isGuest: true,
        };
        logger.info("StudentClassroomModals", "Initialized in guest mode");
      } else {
        this.currentStudent = await this.firebaseService.getCurrentUser();
        if (!this.currentStudent) {
          throw new Error("User must be authenticated to join classrooms");
        }
        logger.info(
          "StudentClassroomModals",
          "Initialized with authenticated user",
        );
      }

      this.initialized = true;
      logger.info("StudentClassroomModals", "Initialized successfully", {
        guestMode: isGuestMode,
      });
    } catch (error) {
      logger.error("StudentClassroomModals", "Initialization failed", error);
      throw error;
    }
  }

  /**
   * Show join classroom modal
   */
  async showJoinClassroomModal(prefilledCode = "", isGuestMode = false) {
    try {
      await this.initialize(isGuestMode);

      // Seed import removed: join flow relies on 'join' code only

      const modalContent = this.buildJoinClassroomContent(
        prefilledCode,
        isGuestMode,
      );

      const modalTitle = isGuestMode
        ? "👨‍🎓 Join Classroom (Guest Mode)"
        : "👨‍🎓 Join Classroom";

      this.joinClassroomModal = new ModalUtility({
        title: modalTitle,
        content: modalContent,
        size: "medium",
        className: "student-join-classroom-modal",
        onClose: () => this.handleJoinClassroomClose(),
      });

      this.joinClassroomModal.open();
      this.setupJoinClassroomEvents();

      // Focus on appropriate field
      setTimeout(() => {
        const focusField = prefilledCode
          ? this.joinClassroomModal.element.querySelector("#student-nickname")
          : this.joinClassroomModal.element.querySelector("#classroom-code");
        focusField?.focus();
      }, 100);

      logClassroomEvent("join_classroom_modal_opened", {
        student_id: this.currentStudent.uid,
        prefilled_code: !!prefilledCode,
      });
    } catch (error) {
      logger.error(
        "StudentClassroomModals",
        "Failed to show join classroom modal",
        error,
      );
      this.showErrorToast("Failed to open classroom join dialog");
    }
  }

  /**
   * Build join classroom modal content
   */
  buildJoinClassroomContent(prefilledCode = "", isGuestMode = false) {
    const guestNotice = isGuestMode
      ? `
      <div class="guest-mode-notice">
        <div class="notice-content">
          <i class="fas fa-info-circle"></i>
          <strong>Guest Mode:</strong> You're joining as a temporary participant. Your progress won't be saved permanently.
        </div>
      </div>
    `
      : "";

    return `
      ${guestNotice}
      <div class="join-classroom-form">
        <!-- Instructions -->
        <div class="join-instructions">
          <p>Enter the classroom code provided by your instructor and choose a nickname to join the session.</p>
        </div>

        <!-- Form Fields -->
        <div class="form-section">
          <div class="form-group">
            <label for="classroom-code" class="required">Classroom Code</label>
            <input 
              type="text" 
              id="classroom-code" 
              name="classroom-code"
              placeholder="e.g., ABC-123"
              maxlength="7"
              value="${prefilledCode}"
              autocomplete="off"
              style="text-transform: uppercase;"
              required
            />
            <small class="helper-text">Enter the 6-character code from your instructor</small>
            <div class="validation-message" id="code-validation"></div>
          </div>

          <div class="form-group">
            <label for="student-nickname" class="required">Your Nickname</label>
            <input 
              type="text" 
              id="student-nickname" 
              name="student-nickname"
              placeholder="e.g., Alex, Sam, Jordan"
              maxlength="${CLASSROOM_CONSTANTS.NICKNAME_MAX_LENGTH}"
              autocomplete="username"
              required
            />
            <small class="helper-text">This is how you'll appear to your instructor and classmates</small>
            <div class="validation-message" id="nickname-validation"></div>
          </div>
        </div>

        <!-- Join Options -->
        <div class="join-options">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" id="remember-nickname" checked />
              <span class="checkmark"></span>
              Remember my nickname for future sessions
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-join-classroom">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" id="join-classroom-submit" disabled>
            <span class="btn-icon">🚪</span>
            Join Classroom
          </button>
        </div>

        <!-- Loading State -->
        <div class="loading-overlay" id="join-loading" style="display: none;">
          <div class="loading-spinner"></div>
          <p>Joining classroom...</p>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners for join classroom modal
   */
  setupJoinClassroomEvents() {
    if (!this.joinClassroomModal?.element) return;

    const modal = this.joinClassroomModal.element;

    // Form validation
    const codeInput = modal.querySelector("#classroom-code");
    const nicknameInput = modal.querySelector("#student-nickname");
    const submitButton = modal.querySelector("#join-classroom-submit");

    // Real-time validation
    codeInput?.addEventListener("input", this.handleCodeInputChange.bind(this));
    nicknameInput?.addEventListener(
      "input",
      this.handleNicknameInputChange.bind(this),
    );

    // Code formatting
    codeInput?.addEventListener("input", (e) => {
      e.target.value = formatClassroomCode(e.target.value);
    });

    // Form submission
    submitButton?.addEventListener(
      "click",
      this.handleJoinClassroomSubmit.bind(this),
    );

    // Cancel
    modal
      .querySelector("#cancel-join-classroom")
      ?.addEventListener("click", () => {
        this.joinClassroomModal.close();
      });

    // Enter key submission
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !submitButton.disabled) {
        e.preventDefault();
        this.handleJoinClassroomSubmit();
      }
    });

    // Load saved nickname if available
    this.loadSavedNickname();
  }

  /**
   * Handle classroom code input changes with validation
   */
  handleCodeInputChange(event) {
    const code = event.target.value;
    const validation =
      event.target.parentElement.querySelector("#code-validation");

    if (code.length === 0) {
      validation.textContent = "";
      validation.className = "validation-message";
    } else if (validateClassroomCode(code)) {
      validation.textContent = "✓ Valid code format";
      validation.className = "validation-message valid";
    } else {
      validation.textContent =
        "✗ Code must be 3 letters, hyphen, 3 numbers (e.g., ABC-123)";
      validation.className = "validation-message invalid";
    }

    this.validateJoinForm();
  }

  /**
   * Handle nickname input changes with validation
   */
  handleNicknameInputChange(event) {
    const nickname = event.target.value;
    const validation = event.target.parentElement.querySelector(
      "#nickname-validation",
    );

    if (nickname.length === 0) {
      validation.textContent = "";
      validation.className = "validation-message";
    } else {
      const result = validateNickname(nickname, []); // Will check uniqueness on server

      if (result.isValid) {
        validation.textContent = "✓ Valid nickname";
        validation.className = "validation-message valid";
      } else {
        validation.textContent = "✗ " + result.message;
        validation.className = "validation-message invalid";
      }
    }

    this.validateJoinForm();
  }

  /**
   * Validate join form and enable/disable submit button
   */
  validateJoinForm() {
    const modal = this.joinClassroomModal?.element;
    if (!modal) return false;

    const code = modal.querySelector("#classroom-code")?.value?.trim();
    const nickname = modal.querySelector("#student-nickname")?.value?.trim();
    const submitButton = modal.querySelector("#join-classroom-submit");

    const isValid =
      validateClassroomCode(code) &&
      nickname &&
      nickname.length >= CLASSROOM_CONSTANTS.NICKNAME_MIN_LENGTH;

    if (submitButton) {
      submitButton.disabled = !isValid;
    }

    return isValid;
  }

  /**
   * Handle join classroom form submission
   */
  async handleJoinClassroomSubmit() {
    try {
      if (!this.validateJoinForm()) {
        this.showErrorToast("Please complete all required fields correctly");
        return;
      }

      const modal = this.joinClassroomModal.element;
      const classroomCode = modal
        .querySelector("#classroom-code")
        .value.trim()
        .toUpperCase();
      const nickname = modal.querySelector("#student-nickname").value.trim();
      const rememberNickname =
        modal.querySelector("#remember-nickname").checked;

      // Show loading state
      this.showJoinLoading(true);

      // Save nickname if requested (non-blocking)
      if (rememberNickname) {
        this.saveNickname(nickname).catch((err) =>
          logger.warn("StudentClassroomModals", "Nickname save failed", err),
        );
      }

      // Join classroom
      logger.info("StudentClassroomModals", "Attempting to join classroom", {
        classroomCode,
        studentId: this.currentStudent.uid,
      });
      const result = await this.classroomService.joinClassroom(
        classroomCode,
        this.currentStudent.uid,
        nickname,
      );

      if (!result || !result.studentInfo) {
        logger.warn(
          "StudentClassroomModals",
          "Join returned no result or missing studentInfo",
          result,
        );
        this.showErrorToast(
          "Join failed unexpectedly. Please try again or refresh the page.",
        );
        return;
      }

      // Store current classroom and student info
      this.currentClassroom = result;
      this.studentInfo = result.studentInfo;

      // Close join modal and show waiting room
      logger.info(
        "StudentClassroomModals",
        "Join success, opening waiting room",
      );
      this.joinClassroomModal.close();
      this.showWaitingRoomModal(result);

      logClassroomEvent("student_joined", {
        classroom_code: classroomCode,
        student_id: this.currentStudent.uid,
        nickname: nickname,
      });
    } catch (error) {
      logger.error("StudentClassroomModals", "Failed to join classroom", error);

      // Show specific error messages
      let errorMessage = "Failed to join classroom";
      if (error.message.includes("not found")) {
        errorMessage =
          "Classroom not found. Please check the code and try again.";
      } else if (error.message.includes("full")) {
        errorMessage =
          "This classroom is full and cannot accept more students.";
      } else if (error.message.includes("nickname")) {
        errorMessage =
          "This nickname is already taken. Please choose a different one.";
      }

      this.showErrorToast(errorMessage);
    } finally {
      // Always stop loading state to prevent overlay hang
      this.showJoinLoading(false);
    }
  }

  /**
   * Show waiting room modal
   */
  showWaitingRoomModal(classroom) {
    const modalContent = this.buildWaitingRoomContent(classroom);

    this.waitingRoomModal = new ModalUtility({
      title: `⏳ Waiting Room: ${classroom.classroomName}`,
      content: modalContent,
      size: "medium",
      className: "student-waiting-room-modal",
      closeOnBackdrop: false,
      onClose: () => this.handleWaitingRoomClose(),
    });

    this.waitingRoomModal.open();
    this.setupWaitingRoomEvents(classroom);
    this.startWaitingRoomListeners(classroom.classroomCode);
  }

  /**
   * Build waiting room modal content
   */
  buildWaitingRoomContent(classroom) {
    return `
      <div class="waiting-room-container">
        <!-- Session Information -->
        <div class="session-info">
          <div class="classroom-details">
            <h3>${classroom.classroomName}</h3>
            <p>Instructor: ${classroom.instructorName}</p>
            <p>Scenarios: ${classroom.selectedScenarios.length}</p>
          </div>

          <div class="student-info">
            <div class="student-avatar">
              ${this.studentInfo.nickname.charAt(0).toUpperCase()}
            </div>
            <div class="student-details">
              <span class="student-nickname">${this.studentInfo.nickname}</span>
              <span class="student-status">Waiting for session to start</span>
            </div>
          </div>
        </div>

        <!-- Session Status -->
        <div class="session-status-display">
          <div class="status-indicator" id="session-status-indicator">
            <div class="status-icon waiting">⏳</div>
            <div class="status-text">
              <h4 id="status-title">Waiting for instructor</h4>
              <p id="status-description">Your instructor will start the session shortly.</p>
            </div>
          </div>
        </div>

        <!-- Class Roster -->
        <div class="waiting-room-roster">
          <h4>👥 Students in Classroom <span class="student-count" id="waiting-student-count">(1)</span></h4>
          <div class="roster-list" id="waiting-roster-list">
            <!-- Updated by real-time listeners -->
          </div>
        </div>

        <!-- Session Preview -->
        <div class="session-preview">
          <h4>📋 Session Overview</h4>
          <div class="scenario-preview-list">
            ${classroom.selectedScenarios
              .map(
                (scenario, index) => `
              <div class="scenario-preview-item">
                <span class="scenario-number">${index + 1}</span>
                <div class="scenario-info">
                  <span class="scenario-title">${scenario.title}</span>
                  <span class="scenario-category">${scenario.category}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="waiting-room-actions">
          <button type="button" class="btn btn-outline" id="leave-classroom">
            🚪 Leave Classroom
          </button>
          <button type="button" class="btn btn-primary" id="start-session-button" style="display: none;">
            🚀 Start Session
          </button>
        </div>

        <!-- Connection Status -->
        <div class="connection-status">
          <span class="connection-indicator" id="connection-indicator">🟢</span>
          <span class="connection-text">Connected</span>
        </div>
      </div>
    `;
  }

  /**
   * Setup waiting room event listeners
   */
  setupWaitingRoomEvents(classroom) {
    if (!this.waitingRoomModal?.element) return;

    const modal = this.waitingRoomModal.element;

    // Leave classroom
    modal.querySelector("#leave-classroom")?.addEventListener("click", () => {
      this.handleLeaveClassroom();
    });

    // Start session (when instructor starts)
    modal
      .querySelector("#start-session-button")
      ?.addEventListener("click", (e) => {
        // Prevent any default form submission or bubbling to modal close
        e.preventDefault();
        e.stopPropagation();
        // Mark that we are transitioning into the scenario flow so the
        // waiting room close callback does not treat this as a "leave"
        this._suppressWaitingRoomClose = true;
        this.startScenarioSession(classroom);
      });
  }

  /**
   * Start real-time listeners for waiting room
   */
  startWaitingRoomListeners(classroomCode) {
    // Session status listener
    const statusUnsubscribe = this.classroomService.listenToSessionStatus(
      classroomCode,
      this.handleSessionStatusUpdate.bind(this),
    );
    this.activeListeners.push({
      name: "session_status",
      unsubscribe: statusUnsubscribe,
    });

    // Roster listener
    const rosterUnsubscribe = this.classroomService.listenToRoster(
      classroomCode,
      this.handleWaitingRosterUpdate.bind(this),
    );
    this.activeListeners.push({
      name: "waiting_roster",
      unsubscribe: rosterUnsubscribe,
    });
  }

  /**
   * Handle session status updates
   */
  handleSessionStatusUpdate(sessionStatus) {
    this.sessionStatus = sessionStatus;

    const modal = this.waitingRoomModal?.element;
    if (!modal) return;

    const statusIndicator = modal.querySelector("#session-status-indicator");
    const statusTitle = modal.querySelector("#status-title");
    const statusDescription = modal.querySelector("#status-description");
    const startButton = modal.querySelector("#start-session-button");

    if (sessionStatus.isLive) {
      // Session started
      statusIndicator.querySelector(".status-icon").textContent = "🔴";
      statusIndicator.querySelector(".status-icon").className =
        "status-icon live";
      statusTitle.textContent = "Session Started!";
      statusDescription.textContent =
        "Click the button below to begin the scenarios.";
      startButton.style.display = "block";

      logClassroomEvent("session_started_notification", {
        classroom_code: this.currentClassroom.classroomCode,
        student_id: this.currentStudent.uid,
      });
    } else if (sessionStatus.isPaused) {
      // Session paused
      statusIndicator.querySelector(".status-icon").textContent = "⏸️";
      statusIndicator.querySelector(".status-icon").className =
        "status-icon paused";
      statusTitle.textContent = "Session Paused";
      statusDescription.textContent =
        "The instructor has paused the session temporarily.";
      startButton.style.display = "none";
    } else {
      // Waiting
      statusIndicator.querySelector(".status-icon").textContent = "⏳";
      statusIndicator.querySelector(".status-icon").className =
        "status-icon waiting";
      statusTitle.textContent = "Waiting for instructor";
      statusDescription.textContent =
        "Your instructor will start the session shortly.";
      startButton.style.display = "none";
    }
  }

  /**
   * Handle waiting room roster updates
   */
  handleWaitingRosterUpdate(roster) {
    const modal = this.waitingRoomModal?.element;
    if (!modal) return;

    const studentCount = modal.querySelector("#waiting-student-count");
    const rosterList = modal.querySelector("#waiting-roster-list");

    const students = Object.entries(roster || {});

    // Update student count
    if (studentCount) {
      studentCount.textContent = `(${students.length})`;
    }

    // Update roster list
    if (rosterList) {
      rosterList.innerHTML = students
        .map(
          ([studentId, student]) => `
        <div class="waiting-roster-item ${student.isActive ? "active" : "inactive"}">
          <div class="student-avatar small">
            ${student.nickname.charAt(0).toUpperCase()}
          </div>
          <span class="student-nickname">${student.nickname}</span>
          ${studentId === this.currentStudent.uid ? '<span class="you-indicator">(You)</span>' : ""}
        </div>
      `,
        )
        .join("");
    }
  }

  /**
   * Handle leaving classroom
   */
  async handleLeaveClassroom() {
    try {
      if (confirm("Are you sure you want to leave the classroom?")) {
        await this.classroomService.removeStudent(
          this.currentClassroom.classroomCode,
          this.currentStudent.uid,
        );

        this.waitingRoomModal.close();
        this.cleanup();

        logClassroomEvent("student_left", {
          classroom_code: this.currentClassroom.classroomCode,
          student_id: this.currentStudent.uid,
        });

        this.showSuccessToast("Left classroom successfully");
      }
    } catch (error) {
      logger.error(
        "StudentClassroomModals",
        "Failed to leave classroom",
        error,
      );
      this.showErrorToast("Failed to leave classroom");
    }
  }

  /**
   * Force leave classroom without user confirmation (used for global sign-out cleanup)
   * - Removes the student from roster when possible
   * - Silently closes modals and tears down listeners
   */
  async forceLeaveClassroom() {
    try {
      if (this.currentClassroom && this.currentStudent) {
        try {
          await this.classroomService.removeStudent(
            this.currentClassroom.classroomCode,
            this.currentStudent.uid,
          );
        } catch (removeErr) {
          // Non-fatal: still proceed with local cleanup
          logger.warn(
            "StudentClassroomModals",
            "Force leave: failed to remove student from roster",
            removeErr,
          );
        }
      }

      // Close waiting room modal if open (no confirmation)
      try {
        this._suppressWaitingRoomClose = true;
        this.waitingRoomModal?.close();
      } catch (_) {
        // ignore
      } finally {
        this._suppressWaitingRoomClose = false;
      }

      // Local teardown
      this.cleanup();

      // Best-effort event logging without user toasts
      try {
        if (this.currentClassroom && this.currentStudent) {
          logClassroomEvent("student_left_silent", {
            classroom_code: this.currentClassroom.classroomCode,
            student_id: this.currentStudent.uid,
            reason: "sign_out",
          });
        }
      } catch (_) {
        // ignore logging errors
      }
    } catch (error) {
      logger.error(
        "StudentClassroomModals",
        "Force leave classroom failed",
        error,
      );
      // Silent failure; do not surface toast during sign-out
    }
  }

  /**
   * Start scenario session (transition from waiting room to scenarios)
   */
  async startScenarioSession(classroom) {
    try {
      // Close waiting room modal
      // Ensure the waiting room's onClose handler doesn't prompt to leave
      this._suppressWaitingRoomClose = true;
      this.waitingRoomModal.close();

      // Start the scenario flow using the existing scenario system
      this.showInfoToast("Starting scenario session...");

      // Basic guards
      const scenarios = (classroom && classroom.selectedScenarios) || [];
      if (!scenarios.length) {
        logger.warn(
          "StudentClassroomModals",
          "No scenarios available to launch",
        );
        this.showErrorToast("No scenarios available in this session");
        return;
      }

      // Attach one-time event bridges for scenario completion and sequencing
      this.attachScenarioEventBridges();

      // Launch the first scenario in the sequence
      const first = scenarios[0];
      const scenarioId = first.scenarioId || first.id || first.scenario || null;
      if (!scenarioId) {
        logger.error(
          "StudentClassroomModals",
          "Unable to determine scenarioId for first scenario",
          first,
        );
        this.showErrorToast("Failed to launch first scenario");
        return;
      }
      await this.launchScenario(scenarioId, first.categoryId || null);

      logClassroomEvent("scenario_session_started", {
        classroom_code: classroom.classroomCode,
        student_id: this.currentStudent.uid,
        scenario_count: classroom.selectedScenarios.length,
      });
    } catch (error) {
      logger.error(
        "StudentClassroomModals",
        "Failed to start scenario session",
        error,
      );
      this.showErrorToast("Failed to start session");
    }
  }

  /**
   * Integrate with existing scenario system
   * This is where we'd connect to the existing scenario modal flow
   */
  integrateWithExistingScenarioSystem(classroom) {
    // Deprecated placeholder retained for backward compatibility
    // Use startScenarioSession -> launchScenario instead.
    const scenarios = (classroom && classroom.selectedScenarios) || [];
    if (!scenarios.length) return;
    const first = scenarios[0];
    const scenarioId = first.scenarioId || first.id || first.scenario || null;
    if (scenarioId) {
      this.attachScenarioEventBridges();
      this.launchScenario(scenarioId, first.categoryId || null);
    }
  }

  /**
   * Launch a scenario using existing app APIs with resilient fallbacks
   */
  async launchScenario(scenarioId, categoryId = null) {
    try {
      // Ensure classroom student mode when launching via classroom flows
      if (window.scenarioCoordinator) {
        window.scenarioCoordinator.setMode(SCENARIO_MODES.CLASSROOM_LIVE);
      }
      // Preferred: use MainGrid API (can accept null categoryId)
      if (
        window.app &&
        window.app.categoryGrid &&
        typeof window.app.categoryGrid.openScenarioModal === "function"
      ) {
        window.app.categoryGrid.openScenarioModal(
          scenarioId,
          categoryId || null,
        );
        return;
      }

      // Next: use a globally available ScenarioModal instance if present
      if (window.app && window.app.scenarioModal) {
        await window.app.scenarioModal.open(scenarioId, categoryId || null);
        return;
      }

      // Fallback: dynamic import and open directly
      const { default: ScenarioModal } = await import("./scenario-modal.js");
      const modal = new ScenarioModal();
      await modal.open(scenarioId, categoryId || null);
    } catch (err) {
      logger.error("StudentClassroomModals", "Failed to launch scenario", err);
      this.showErrorToast(`Failed to open scenario: ${scenarioId}`);
    }
  }

  /**
   * Attach document-level listeners to bridge scenario events to classroom service
   */
  attachScenarioEventBridges() {
    if (this._scenarioHandlersAttached) return;

    this._onScenarioCompleted = async (event) => {
      try {
        const detail = event?.detail || {};
        const scenarioId = detail.scenarioId || detail.currentScenarioId;
        const selected = detail.selectedOption || detail.option || {};
        const choiceValue =
          selected.id ||
          selected.value ||
          selected.text ||
          selected.label ||
          null;

        if (scenarioId && choiceValue) {
          await this.classroomService.submitStudentChoice(
            this.currentClassroom.classroomCode,
            this.currentStudent.uid,
            scenarioId,
            choiceValue,
            {
              confidence: selected.confidence ?? null,
            },
          );
        }
      } catch (e) {
        logger.warn(
          "StudentClassroomModals",
          "Failed to submit student choice from scenario event",
          e,
        );
      }
    };

    // Listen for reflection completion events to coordinate final summary timing
    this._onReflectionCompleted = (event) => {
      try {
        const detail = event?.detail || {};
        const scenarioId = detail.scenarioId;
        this._latestReflectionCompleted = {
          scenarioId,
          ts: Date.now(),
        };
        logger.debug(
          "StudentClassroomModals",
          `${event.type} received`,
          this._latestReflectionCompleted,
        );
      } catch (_) {
        // ignore
      }
    };

    this._onScenarioClosed = async (event) => {
      try {
        const detail = event?.detail || {};
        const completed = !!detail.completed;
        const scenarioId = detail.scenarioId || detail.currentScenarioId;
        if (!this.currentClassroom) return;

        // Find next scenario and launch if available
        const nextId = this.getNextScenarioId(scenarioId);
        if (completed && nextId) {
          // Small delay to ensure previous modal teardown completes
          setTimeout(() => this.launchScenario(nextId, null), 250);
          return;
        }

        // If no next scenario and we have completion, wait for reflection to finish, then show final summary
        if (completed && !nextId) {
          try {
            // Gate on reflection closing or completion event to avoid overlay conflicts
            await this._waitForReflectionCompletion(scenarioId, 4000);

            const refreshed = await this.classroomService.getClassroom(
              this.currentClassroom.classroomCode,
            );
            const studentChoices = refreshed?.studentChoices?.[
              this.currentStudent.uid
            ] || {
              scenarios: {},
            };
            this.showFinalChoicesModal(studentChoices);
          } catch (err) {
            logger.warn(
              "StudentClassroomModals",
              "Failed to fetch classroom for final summary",
              err,
            );
            this.showFinalChoicesModal({ scenarios: {} });
          }
        }
      } catch (e) {
        logger.warn(
          "StudentClassroomModals",
          "Error handling scenario modal closed event",
          e,
        );
      }
    };

    document.addEventListener("scenario-completed", this._onScenarioCompleted);
    document.addEventListener("scenario-modal-closed", this._onScenarioClosed);
    // Listen to both configured event name and fallback
    try {
      import("../utils/scenario-reflection-config-loader.js").then(
        ({ loadScenarioReflectionConfig }) => {
          loadScenarioReflectionConfig()
            .then((cfg) => cfg?.integration?.badgeSystem?.eventName)
            .then((evtName) => {
              const name = evtName || "scenarioReflectionCompleted";
              if (!this._reflectionEvtNames)
                this._reflectionEvtNames = new Set();
              const addIfNeeded = (n) => {
                if (this._reflectionEvtNames.has(n)) return;
                document.addEventListener(n, this._onReflectionCompleted);
                this._reflectionEvtNames.add(n);
              };
              addIfNeeded(name);
              if (name !== "scenarioReflectionCompleted") {
                addIfNeeded("scenarioReflectionCompleted");
              }
            })
            .catch(() => {
              document.addEventListener(
                "scenarioReflectionCompleted",
                this._onReflectionCompleted,
              );
            });
        },
      );
    } catch (_) {
      document.addEventListener(
        "scenarioReflectionCompleted",
        this._onReflectionCompleted,
      );
    }
    this._scenarioHandlersAttached = true;
  }

  /**
   * Remove scenario event bridges
   */
  detachScenarioEventBridges() {
    if (!this._scenarioHandlersAttached) return;
    try {
      document.removeEventListener(
        "scenario-completed",
        this._onScenarioCompleted,
      );
      document.removeEventListener(
        "scenario-modal-closed",
        this._onScenarioClosed,
      );
      if (this._reflectionEvtNames && this._reflectionEvtNames.size) {
        this._reflectionEvtNames.forEach((n) =>
          document.removeEventListener(n, this._onReflectionCompleted),
        );
      } else {
        document.removeEventListener(
          "scenarioReflectionCompleted",
          this._onReflectionCompleted,
        );
      }
    } catch (_) {
      // ignore
    }
    this._scenarioHandlersAttached = false;
    this._onScenarioCompleted = null;
    this._onScenarioClosed = null;
    this._onReflectionCompleted = null;
    this._reflectionEvtNames = null;
  }

  /**
   * Wait until the reflection modal fully completes/closes for a given scenario
   * Resolves early if no reflection is present or a recent completion event exists.
   * @param {string} scenarioId
   * @param {number} timeoutMs
   */
  async _waitForReflectionCompletion(scenarioId, timeoutMs = 4000) {
    try {
      // If no reflection modal is visible, proceed immediately
      const hasReflectionModal = !!document.querySelector(
        ".scenario-reflection-modal",
      );

      // If we already observed completion for this scenario very recently, proceed
      const recent = this._latestReflectionCompleted;
      if (
        !hasReflectionModal ||
        (recent &&
          recent.scenarioId === scenarioId &&
          Date.now() - recent.ts < 5000)
      ) {
        return;
      }

      // Otherwise, wait for either the event or the element to disappear, with timeout
      await new Promise((resolve) => {
        let done = false;
        const onDone = () => {
          if (done) return;
          done = true;
          cleanup();
          resolve();
        };

        const observer = new MutationObserver(() => {
          const stillPresent = document.querySelector(
            ".scenario-reflection-modal",
          );
          if (!stillPresent) onDone();
        });

        const evtHandler = (e) => {
          const id = e?.detail?.scenarioId;
          if (!scenarioId || !id || id === scenarioId) onDone();
        };

        const cleanup = () => {
          try {
            observer.disconnect();
          } catch (_) {
            // ignore disconnect errors
          }
          try {
            const names = Array.from(
              this._reflectionEvtNames ||
                new Set(["scenarioReflectionCompleted"]),
            );
            names.forEach((n) => document.removeEventListener(n, evtHandler));
          } catch (_) {
            // ignore
          }
          clearTimeout(timer);
        };

        // Observe DOM removals
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // Listen for completion events (configured + fallback)
        const evtNames = Array.from(
          this._reflectionEvtNames || new Set(["scenarioReflectionCompleted"]),
        );
        evtNames.forEach((n) => document.addEventListener(n, evtHandler));

        // Timeout fallback
        const timer = setTimeout(onDone, timeoutMs);
      });
    } catch (_) {
      // On any error, don't block the flow
      return;
    }
  }

  /**
   * Compute next scenario id from current classroom sequence
   */
  getNextScenarioId(currentScenarioId) {
    try {
      const list = (this.currentClassroom?.selectedScenarios || []).map(
        (s) => s.scenarioId || s.id || s.scenario,
      );
      if (!list.length) return null;
      const idx = list.indexOf(currentScenarioId);
      if (idx === -1) return null;
      return list[idx + 1] || null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Show final choices modal (after all scenarios completed)
   */
  showFinalChoicesModal(studentChoices) {
    const modalContent = this.buildFinalChoicesContent(studentChoices);

    this.finalChoicesModal = new ModalUtility({
      title: "✅ Session Complete - Your Choices",
      content: modalContent,
      size: "large",
      className: "student-final-choices-modal",
      onClose: () => this.handleFinalChoicesClose(),
    });

    this.finalChoicesModal.open();
    this.setupFinalChoicesEvents();
  }

  /**
   * Build final choices modal content
   */
  buildFinalChoicesContent(studentChoices) {
    const scenarios = this.currentClassroom?.selectedScenarios || [];

    return `
      <div class="final-choices-container">
        <!-- Session Summary -->
        <div class="session-summary">
          <h3>🎉 Congratulations!</h3>
          <p>You have completed all scenarios in this classroom session.</p>
          
          <div class="completion-stats">
            <div class="stat-item">
              <span class="stat-value">${scenarios.length}</span>
              <span class="stat-label">Scenarios Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${this.currentClassroom?.classroomName}</span>
              <span class="stat-label">Classroom</span>
            </div>
          </div>
        </div>

        <!-- Your Choices Review -->
        <div class="choices-review">
          <h4>📝 Your Choices Review</h4>
          <div class="choices-list">
            ${scenarios
              .map((scenario, index) => {
                const choice = studentChoices.scenarios?.[scenario.scenarioId];
                return `
                <div class="choice-review-item">
                  <div class="scenario-header">
                    <span class="scenario-number">${index + 1}</span>
                    <div class="scenario-info">
                      <h5>${scenario.title}</h5>
                      <span class="scenario-category">${scenario.category}</span>
                    </div>
                  </div>
                  <div class="choice-display">
                    <span class="choice-label">Your choice:</span>
                    <span class="choice-value">${choice?.choice || "No response recorded"}</span>
                    ${choice?.confidence ? `<span class="confidence-level">Confidence: ${choice.confidence}/10</span>` : ""}
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
        </div>

        <!-- Thank You Message -->
        <div class="thank-you-section">
          <h4>🙏 Thank You for Participating!</h4>
          <p>Your responses contribute to AI ethics education and research. If this session was part of a research study, your anonymized data will help improve AI ethics education.</p>
        </div>

        <!-- Action Buttons -->
        <div class="final-actions">
          <button type="button" class="btn btn-outline" id="back-to-scenarios">
            ← Back to Review
          </button>
          <button type="button" class="btn btn-primary" id="finish-session">
            🏁 Finish Session
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Setup final choices modal events
   */
  setupFinalChoicesEvents() {
    if (!this.finalChoicesModal?.element) return;

    const modal = this.finalChoicesModal.element;

    // Back to scenarios (for review)
    modal.querySelector("#back-to-scenarios")?.addEventListener("click", () => {
      // This would allow students to review their choices
      this.showInfoToast("Review functionality would be implemented here");
    });

    // Finish session
    modal.querySelector("#finish-session")?.addEventListener("click", () => {
      this.handleFinishSession();
    });
  }

  /**
   * Handle finishing the session
   */
  handleFinishSession() {
    this.finalChoicesModal.close();
    this.cleanup();

    this.showSuccessToast(
      "Thank you for participating! Session completed successfully.",
    );

    logClassroomEvent("session_completed", {
      classroom_code: this.currentClassroom?.classroomCode,
      student_id: this.currentStudent.uid,
    });
  }

  /**
   * Show loading state for join form
   */
  showJoinLoading(show) {
    const modal = this.joinClassroomModal?.element;
    if (!modal) return;

    const loading = modal.querySelector("#join-loading");

    if (show) {
      loading.style.display = "flex";
      // Disable form elements
      modal
        .querySelectorAll("input, button")
        .forEach((el) => (el.disabled = true));
    } else {
      loading.style.display = "none";
      // Re-enable form elements
      modal
        .querySelectorAll("input, button")
        .forEach((el) => (el.disabled = false));
      this.validateJoinForm(); // Re-validate to set correct button state
    }
  }

  /**
   * Load saved nickname from storage
   */
  async loadSavedNickname() {
    try {
      const savedNickname = await this.dataHandler.getData("saved_nickname");
      if (savedNickname) {
        const nicknameInput =
          this.joinClassroomModal?.element?.querySelector("#student-nickname");
        if (nicknameInput) {
          nicknameInput.value = savedNickname;
          this.handleNicknameInputChange({ target: nicknameInput });
        }
      }
    } catch (error) {
      // Ignore errors when loading saved nickname
      logger.debug("StudentClassroomModals", "No saved nickname found");
    }
  }

  /**
   * Save nickname to storage
   */
  async saveNickname(nickname) {
    try {
      await this.dataHandler.saveData("saved_nickname", nickname);
    } catch (error) {
      logger.warn("StudentClassroomModals", "Failed to save nickname", error);
    }
  }

  /**
   * Show success toast message
   */
  showSuccessToast(message) {
    // This would integrate with the existing toast system
    console.log("✅ Success:", message);
  }

  /**
   * Show error toast message
   */
  showErrorToast(message) {
    // This would integrate with the existing toast system
    console.log("❌ Error:", message);
  }

  /**
   * Show info toast message
   */
  showInfoToast(message) {
    // This would integrate with the existing toast system
    console.log("ℹ️ Info:", message);
  }

  /**
   * Cleanup method
   */
  cleanup() {
    // Stop all active listeners
    this.activeListeners.forEach((listener) => {
      try {
        listener.unsubscribe();
      } catch (error) {
        logger.warn(
          "StudentClassroomModals",
          `Failed to cleanup ${listener.name} listener`,
          error,
        );
      }
    });
    this.activeListeners = [];

    // Detach scenario bridges if attached
    this.detachScenarioEventBridges?.();

    // Close modals
    this.joinClassroomModal?.close();
    this.waitingRoomModal?.close();
    this.finalChoicesModal?.close();

    // Clear state
    this.currentClassroom = null;
    this.studentInfo = null;
    this.sessionStatus = null;
    this._scenarioHandlersAttached = false;

    logger.info("StudentClassroomModals", "Cleanup completed");
  }

  // Event handlers for close operations
  handleJoinClassroomClose() {
    // Clear form if needed
  }

  handleWaitingRoomClose() {
    // If we're programmatically closing to start the session, skip leave flow
    if (this._suppressWaitingRoomClose) {
      this._suppressWaitingRoomClose = false;
      return; // do not treat as a leave action
    }

    // Confirm before leaving only on user-initiated closes
    if (this.currentClassroom) {
      this.handleLeaveClassroom();
    }
  }

  handleFinalChoicesClose() {
    this.cleanup();
  }
}
