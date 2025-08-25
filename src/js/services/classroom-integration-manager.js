/**
 * Classroom Integration Manager
 * Handles initialization and integration of teacher and student classroom modals
 * @author SimulateAI Development Team
 * @since 1.80.0
 */

import TeacherClassroomModals from "../components/teacher-classroom-modals.js";
import StudentClassroomModals from "../components/student-classroom-modals.js";
import globalEventManager from "../core/global-event-manager.js";
import logger from "../utils/logger.js";
import eventDispatcher, { AUTH_EVENTS } from "../utils/event-dispatcher.js";

class ClassroomIntegrationManager {
  constructor(dataHandler, firebaseService) {
    this.dataHandler = dataHandler;
    this.firebaseService = firebaseService;

    // Modal instances
    this.teacherModals = null;
    this.studentModals = null;

    // User state
    this.currentUser = null;
    this.userRole = null;

    this.initialized = false;
  }

  /**
   * Initialize classroom integration
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Get current user and determine capabilities
      this.currentUser =
        (window.authService && window.authService.getCurrentUser?.()) ||
        (await this.firebaseService.getCurrentUser());

      // Stay in sync with global auth state (so we don't re-prompt users)
      this._onAuthStateChanged = (event) => {
        try {
          const user = event?.detail?.user || null;
          this.currentUser = user;
        } catch (_) {
          // ignore
        }
      };
      try {
        eventDispatcher.on(
          AUTH_EVENTS.AUTH_STATE_CHANGED,
          this._onAuthStateChanged,
        );
      } catch (_) {
        // ignore
      }

      // On explicit sign-out, ensure any active classroom session is exited/cleaned
      this._onUserSignedOut = async () => {
        try {
          // Prefer silent leave to avoid prompts during sign-out
          if (
            this.studentModals &&
            typeof this.studentModals.forceLeaveClassroom === "function"
          ) {
            await this.studentModals.forceLeaveClassroom();
          } else if (
            this.studentModals &&
            typeof this.studentModals.handleLeaveClassroom === "function"
          ) {
            // Fallback if older build without forceLeaveClassroom
            try {
              // Temporarily bypass confirmation by setting suppress flag
              this.studentModals._suppressWaitingRoomClose = true;
              await this.studentModals.handleLeaveClassroom();
            } finally {
              this.studentModals._suppressWaitingRoomClose = false;
            }
          }

          // Also close any teacher-side modals/listeners
          try {
            this.teacherModals?.cleanup?.();
          } catch (_) {
            // ignore
          }

          logger.info(
            "ClassroomIntegrationManager",
            "Performed classroom cleanup on user sign-out",
          );
        } catch (err) {
          logger.warn(
            "ClassroomIntegrationManager",
            "Sign-out classroom cleanup encountered an error",
            err,
          );
        }
      };
      try {
        eventDispatcher.on(AUTH_EVENTS.USER_SIGNED_OUT, this._onUserSignedOut);
      } catch (_) {
        // ignore
      }

      // Initialize both teacher and student modals
      // (Users can switch between roles in the same session)
      this.teacherModals = new TeacherClassroomModals(
        this.dataHandler,
        this.firebaseService,
      );
      this.studentModals = new StudentClassroomModals(
        this.dataHandler,
        this.firebaseService,
      );

      // Setup event listeners for classroom buttons
      this.setupClassroomButtons();

      // Register with global event manager
      this.registerWithEventManager();

      this.initialized = true;
      logger.info("ClassroomIntegrationManager", "Initialized successfully");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Initialization failed",
        error,
      );
      // Don't throw - classroom features are optional
    }
  }

  /**
   * Setup classroom button event listeners
   */
  setupClassroomButtons() {
    // Create Classroom button
    const createClassroomBtn = document.getElementById("create-classroom");
    if (createClassroomBtn) {
      createClassroomBtn.addEventListener(
        "click",
        this.handleCreateClassroom.bind(this),
      );
    }

    // Join Classroom button
    const joinClassroomBtn = document.getElementById("join-classroom");
    if (joinClassroomBtn) {
      joinClassroomBtn.addEventListener(
        "click",
        this.handleJoinClassroom.bind(this),
      );
    }

    logger.info("ClassroomIntegrationManager", "Classroom buttons configured");
  }

  /**
   * Register with global event manager for automatic event handling
   */
  registerWithEventManager() {
    globalEventManager.registerComponent("classroomIntegration", this, {
      "classroom.create": this.handleCreateClassroom.bind(this),
      "classroom.join": this.handleJoinClassroom.bind(this),
      "classroom.teacher_action": this.handleTeacherAction.bind(this),
      "classroom.student_action": this.handleStudentAction.bind(this),
    });
  }

  /**
   * Handle create classroom button click
   */
  async handleCreateClassroom() {
    try {
      // Check if user is authenticated (use latest from AuthService if available)
      const user =
        (window.authService && window.authService.getCurrentUser?.()) ||
        this.currentUser ||
        (await this.firebaseService.getCurrentUser());
      this.currentUser = user;
      if (!user) {
        await this.handleUnauthenticatedUser("create");
        return;
      }

      // Show teacher classroom creation modal
      await this.teacherModals.initialize();
      await this.teacherModals.showCreateClassroomModal();

      logger.info("ClassroomIntegrationManager", "Create classroom initiated", {
        user_id: this.currentUser.uid,
      });
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to create classroom",
        error,
      );
      this.showErrorMessage(
        "Failed to open classroom creation. Please try again.",
      );
    }
  }

  /**
   * Handle join classroom button click
   */
  async handleJoinClassroom() {
    try {
      // Check if user is authenticated (use latest from AuthService if available)
      const user =
        (window.authService && window.authService.getCurrentUser?.()) ||
        this.currentUser ||
        (await this.firebaseService.getCurrentUser());
      this.currentUser = user;
      if (!user) {
        await this.handleUnauthenticatedUser("join");
        return;
      }

      // Extract classroom code from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      // Support multiple param names for backward compatibility and share links
      const classroomCode =
        urlParams.get("join") ||
        urlParams.get("classroom") ||
        urlParams.get("code");

      // Show student join classroom modal
      await this.studentModals.initialize();
      await this.studentModals.showJoinClassroomModal(classroomCode || "");

      logger.info("ClassroomIntegrationManager", "Join classroom initiated", {
        user_id: this.currentUser.uid,
        prefilled_code: !!classroomCode,
      });
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to join classroom",
        error,
      );
      this.showErrorMessage(
        "Failed to open classroom join dialog. Please try again.",
      );
    }
  }

  /**
   * Handle unauthenticated user attempting classroom actions
   */
  async handleUnauthenticatedUser(action) {
    const actionText =
      action === "create" ? "create a classroom" : "join a classroom";
    const actionTitle =
      action === "create" ? "Create Classroom" : "Join Classroom";

    try {
      const userChoice = await this.showAuthenticationModal(
        actionTitle,
        actionText,
      );

      if (userChoice === "signin") {
        // User chose to sign in
        await this.handleSignIn(action);
      } else if (userChoice === "guest") {
        // User chose to continue as guest
        await this.handleGuestMode(action);
      }
      // If userChoice is null, user cancelled/closed modal - no action needed
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Authentication handling failed",
        error,
      );
      this.showErrorMessage("Unable to proceed. Please try again.");
    }
  }

  /**
   * Show authentication modal with sign-in and guest options
   */
  async showAuthenticationModal(title, actionText) {
    return new Promise((resolve) => {
      // Create modal HTML
      const modalHTML = `
        <div class="classroom-auth-modal" id="classroom-auth-modal">
          <div class="modal-backdrop" data-modal-action="backdrop-click"></div>
          <div class="modal-container">
            <div class="modal-header">
              <h3>${title}</h3>
              <button class="modal-close-btn" data-modal-action="close">×</button>
            </div>
            <div class="modal-body">
              <div class="auth-options">
                <div class="auth-message">
                  <p>To ${actionText}, you can either sign in with your account or continue as a guest.</p>
                </div>
                
                <div class="auth-choice-container">
                  <div class="auth-choice recommended">
                    <div class="choice-icon">
                      <i class="fab fa-google"></i>
                    </div>
                    <div class="choice-content">
                      <h4>Sign In with Google</h4>
                      <p>Full features, save progress, sync across devices</p>
                      <ul class="choice-benefits">
                        <li>✓ Save classroom settings</li>
                        <li>✓ Track student progress</li>
                        <li>✓ Access analytics</li>
                        <li>✓ Sync across devices</li>
                      </ul>
                    </div>
                    <button class="btn-auth-primary" data-choice="signin">
                      <i class="fab fa-google"></i> Sign In
                    </button>
                  </div>
                  
                  <div class="auth-choice guest">
                    <div class="choice-icon">
                      <i class="fas fa-user-clock"></i>
                    </div>
                    <div class="choice-content">
                      <h4>Continue as Guest</h4>
                      <p>Basic features, temporary session</p>
                      <ul class="choice-benefits">
                        <li>✓ Basic classroom functionality</li>
                        <li>✓ No account required</li>
                        <li>⚠️ Progress not saved</li>
                        <li>⚠️ Limited features</li>
                      </ul>
                    </div>
                    <button class="btn-auth-secondary" data-choice="guest">
                      <i class="fas fa-user-clock"></i> Continue as Guest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      // Add modal styles
      const modalStyles = `
        <style id="classroom-auth-modal-styles">
          .classroom-auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: modalFadeIn 0.2s ease;
          }
          
          .classroom-auth-modal .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
          }
          
          .classroom-auth-modal .modal-container {
            position: relative;
            background: var(--theme-bg-primary, #fff);
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
          }
          
          .classroom-auth-modal .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid var(--theme-border-primary, #e0e0e0);
          }
          
          .classroom-auth-modal .modal-header h3 {
            margin: 0;
            font-size: 1.4em;
            color: var(--theme-text-primary, #333);
          }
          
          .classroom-auth-modal .modal-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--theme-text-secondary, #666);
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
          }
          
          .classroom-auth-modal .modal-close-btn:hover {
            background: var(--theme-bg-secondary, #f5f5f5);
            color: var(--theme-text-primary, #333);
          }
          
          .classroom-auth-modal .modal-body {
            padding: 24px;
          }
          
          .classroom-auth-modal .auth-message {
            text-align: center;
            margin-bottom: 24px;
          }
          
          .classroom-auth-modal .auth-message p {
            font-size: 1.1em;
            color: var(--theme-text-secondary, #555);
            margin: 0;
          }
          
          .classroom-auth-modal .auth-choice-container {
            display: grid;
            gap: 16px;
          }
          
          .classroom-auth-modal .auth-choice {
            border: 2px solid var(--theme-border-primary, #e0e0e0);
            border-radius: 8px;
            padding: 20px;
            transition: all 0.2s ease;
            position: relative;
          }
          
          .classroom-auth-modal .auth-choice.recommended {
            border-color: var(--theme-accent-primary, var(--color-primary, #4285f4));
            background: linear-gradient(
              135deg,
              var(--theme-bg-secondary, #f8fbff) 0%,
              var(--theme-bg-tertiary, #e3f2fd) 100%
            );
          }
          
          .classroom-auth-modal .auth-choice.recommended::before {
            content: "RECOMMENDED";
            position: absolute;
            top: -8px;
            right: 16px;
            background: var(--theme-accent-primary, var(--color-primary, #4285f4));
            color: var(--theme-text-on-accent, #fff);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: 600;
          }
          
          .classroom-auth-modal .auth-choice:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .classroom-auth-modal .choice-icon {
            font-size: 2em;
            text-align: center;
            margin-bottom: 12px;
          }
          
          .classroom-auth-modal .auth-choice.recommended .choice-icon {
            color: var(--theme-accent-primary, var(--color-primary, #4285f4));
          }
          
          .classroom-auth-modal .auth-choice.guest .choice-icon {
            color: var(--accent-color, #ff9800);
          }
          
          .classroom-auth-modal .choice-content h4 {
            margin: 0 0 8px 0;
            font-size: 1.2em;
            text-align: center;
          }
          
          .classroom-auth-modal .choice-content p {
            margin: 0 0 16px 0;
            text-align: center;
            color: var(--theme-text-secondary, #666);
          }
          
          .classroom-auth-modal .choice-benefits {
            list-style: none;
            padding: 0;
            margin: 0 0 20px 0;
          }
          
          .classroom-auth-modal .choice-benefits li {
            padding: 4px 0;
            font-size: 0.9em;
          }
          
          .classroom-auth-modal .btn-auth-primary,
          .classroom-auth-modal .btn-auth-secondary {
            width: 100%;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          
          .classroom-auth-modal .btn-auth-primary {
            background: var(--color-primary, #4285f4);
            color: var(--theme-text-on-accent, #fff);
          }
          
          .classroom-auth-modal .btn-auth-primary:hover {
            background: var(--color-primary-dark, #3367d6);
            transform: translateY(-1px);
          }
          
          .classroom-auth-modal .btn-auth-secondary {
            background: var(--theme-bg-secondary, #f5f5f5);
            color: var(--theme-text-primary, #333);
            border: 1px solid var(--theme-border-primary, #ddd);
          }
          
          .classroom-auth-modal .btn-auth-secondary:hover {
            background: var(--theme-bg-tertiary, #e8e8e8);
            transform: translateY(-1px);
          }
          
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.9) translateY(-20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          @media (max-width: 640px) {
            .classroom-auth-modal .modal-container {
              width: 95%;
              margin: 10px;
            }
            
            .classroom-auth-modal .auth-choice-container {
              grid-template-columns: 1fr;
            }
          }
        </style>`;

      // Add styles to head
      document.head.insertAdjacentHTML("beforeend", modalStyles);

      // Add modal to body
      document.body.insertAdjacentHTML("beforeend", modalHTML);

      const modal = document.getElementById("classroom-auth-modal");

      // Set up event listeners
      const handleChoice = (choice) => {
        // Remove modal and styles
        modal.remove();
        document.getElementById("classroom-auth-modal-styles")?.remove();
        resolve(choice);
      };

      // Choice buttons
      modal
        .querySelector('[data-choice="signin"]')
        .addEventListener("click", () => handleChoice("signin"));
      modal
        .querySelector('[data-choice="guest"]')
        .addEventListener("click", () => handleChoice("guest"));

      // Close buttons
      modal
        .querySelector('[data-modal-action="close"]')
        .addEventListener("click", () => handleChoice(null));
      modal
        .querySelector('[data-modal-action="backdrop-click"]')
        .addEventListener("click", () => handleChoice(null));

      // ESC key
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", handleEsc);
          handleChoice(null);
        }
      };
      document.addEventListener("keydown", handleEsc);

      // Focus management
      modal.querySelector('[data-choice="signin"]').focus();
    });
  }

  /**
   * Handle user choosing to sign in
   */
  async handleSignIn(action) {
    try {
      // Prefer centralized AuthService so modals/state are unified
      if (
        window.authService &&
        typeof window.authService.showLoginModal === "function"
      ) {
        // If already authenticated, proceed immediately
        const existingUser = window.authService.getCurrentUser?.();
        if (existingUser) {
          this.currentUser = existingUser;
        } else {
          // Show the central login modal and wait for sign-in event
          window.authService.showLoginModal();
          await new Promise((resolve) => {
            let resolved = false;
            let listenerAttached = false;
            let handler = null;

            const cleanup = () => {
              try {
                if (listenerAttached && handler) {
                  eventDispatcher.off(AUTH_EVENTS.USER_SIGNED_IN, handler);
                }
              } catch (_) {
                // ignore
              }
              listenerAttached = false;
            };

            const timeout = setTimeout(() => {
              if (!resolved) {
                resolved = true;
                cleanup();
                resolve(); // soft-timeout: don't hang UI
              }
            }, 15000);

            handler = (evt) => {
              try {
                if (resolved) return;
                resolved = true;
                clearTimeout(timeout);
                cleanup();
                this.currentUser =
                  evt?.detail?.user ||
                  window.authService.getCurrentUser?.() ||
                  null;
                resolve();
              } catch (_) {
                resolve();
              }
            };
            // Listen to our centralized dispatcher events
            try {
              eventDispatcher.on(AUTH_EVENTS.USER_SIGNED_IN, handler);
              listenerAttached = true;
            } catch (_) {
              // ignore
            }
          });
        }
      } else {
        // Fallback: direct provider sign-in
        await this.firebaseService.signInWithGoogle();
        this.currentUser = await this.firebaseService.getCurrentUser();
      }

      if (this.currentUser) {
        logger.info(
          "ClassroomIntegrationManager",
          "User signed in successfully",
          {
            user_id: this.currentUser.uid,
            action: action,
          },
        );

        // Retry the original action
        if (action === "create") {
          await this.handleCreateClassroom();
        } else {
          await this.handleJoinClassroom();
        }
      }
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Authentication failed",
        error,
      );
      this.showErrorMessage("Sign in failed. Please try again.");
    }
  }

  /**
   * Handle user choosing to continue as guest
   */
  async handleGuestMode(action) {
    try {
      logger.info("ClassroomIntegrationManager", "User chose guest mode", {
        action: action,
      });

      // Create a temporary guest user object
      this.currentUser = {
        uid: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        displayName: "Guest User",
        email: null,
        isGuest: true,
      };

      // Proceed with the original action in guest mode
      if (action === "create") {
        await this.handleCreateClassroomAsGuest();
      } else {
        await this.handleJoinClassroomAsGuest();
      }

      // Show guest mode notification
      this.showInfoMessage(
        "You're in guest mode. Some features may be limited and progress won't be saved.",
      );
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Guest mode initialization failed",
        error,
      );
      this.showErrorMessage("Failed to start guest mode. Please try again.");
    }
  }

  /**
   * Handle creating classroom as guest
   */
  async handleCreateClassroomAsGuest() {
    // Show teacher classroom creation modal with guest limitations
    await this.teacherModals.initialize(true); // Pass guest mode flag
    await this.teacherModals.showCreateClassroomModal(true); // Pass guest mode flag

    logger.info(
      "ClassroomIntegrationManager",
      "Guest create classroom initiated",
    );
  }

  /**
   * Handle joining classroom as guest
   */
  async handleJoinClassroomAsGuest() {
    // Extract classroom code from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const classroomCode =
      urlParams.get("join") ||
      urlParams.get("classroom") ||
      urlParams.get("code");

    // Show student join classroom modal with guest limitations
    await this.studentModals.initialize(true); // Pass guest mode flag
    await this.studentModals.showJoinClassroomModal(classroomCode || "", true); // Pass guest mode flag

    logger.info(
      "ClassroomIntegrationManager",
      "Guest join classroom initiated",
      {
        prefilled_code: !!classroomCode,
      },
    );
  }

  /**
   * Handle teacher-specific actions
   */
  handleTeacherAction(data) {
    switch (data.action) {
      case "start_session":
        this.handleStartSession(data);
        break;
      case "pause_session":
        this.handlePauseSession(data);
        break;
      case "end_session":
        this.handleEndSession(data);
        break;
      default:
        logger.warn(
          "ClassroomIntegrationManager",
          "Unknown teacher action",
          data,
        );
    }
  }

  /**
   * Handle student-specific actions
   */
  handleStudentAction(data) {
    switch (data.action) {
      case "submit_choice":
        this.handleSubmitChoice(data);
        break;
      case "request_help":
        this.handleRequestHelp(data);
        break;
      case "leave_classroom":
        this.handleLeaveClassroom(data);
        break;
      default:
        logger.warn(
          "ClassroomIntegrationManager",
          "Unknown student action",
          data,
        );
    }
  }

  /**
   * Handle session start
   */
  async handleStartSession(data) {
    try {
      await this.teacherModals.startLiveSession(data.classroomCode);
      this.showSuccessMessage("Session started successfully!");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to start session",
        error,
      );
      this.showErrorMessage("Failed to start session. Please try again.");
    }
  }

  /**
   * Handle session pause
   */
  async handlePauseSession(data) {
    try {
      await this.teacherModals.pauseLiveSession(data.classroomCode);
      this.showSuccessMessage("Session paused.");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to pause session",
        error,
      );
      this.showErrorMessage("Failed to pause session. Please try again.");
    }
  }

  /**
   * Handle session end
   */
  async handleEndSession(data) {
    try {
      await this.teacherModals.endLiveSession(data.classroomCode);
      this.showSuccessMessage("Session ended successfully.");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to end session",
        error,
      );
      this.showErrorMessage("Failed to end session. Please try again.");
    }
  }

  /**
   * Handle student choice submission
   */
  async handleSubmitChoice(data) {
    try {
      // This would integrate with the existing scenario system
      // to capture student choices and submit them to the classroom
      logger.info(
        "ClassroomIntegrationManager",
        "Student choice submitted",
        data,
      );
      this.showSuccessMessage("Choice submitted successfully!");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to submit choice",
        error,
      );
      this.showErrorMessage("Failed to submit choice. Please try again.");
    }
  }

  /**
   * Handle student help request
   */
  async handleRequestHelp(data) {
    try {
      // Notify teacher that student needs help
      logger.info("ClassroomIntegrationManager", "Help requested", data);
      this.showSuccessMessage("Help request sent to instructor.");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to request help",
        error,
      );
      this.showErrorMessage("Failed to send help request. Please try again.");
    }
  }

  /**
   * Handle student leaving classroom
   */
  async handleLeaveClassroom() {
    try {
      await this.studentModals.handleLeaveClassroom();
      this.showSuccessMessage("Left classroom successfully.");
    } catch (error) {
      logger.error(
        "ClassroomIntegrationManager",
        "Failed to leave classroom",
        error,
      );
      this.showErrorMessage("Failed to leave classroom. Please try again.");
    }
  }

  /**
   * Check if classroom features are available
   */
  isClassroomAvailable() {
    return this.initialized && this.firebaseService && this.dataHandler;
  }

  /**
   * Get current user role for classroom context
   */
  getCurrentUserRole() {
    // This could be enhanced to check user profile for preferred role
    return this.userRole || "flexible"; // Default to flexible (can be teacher or student)
  }

  /**
   * Handle URL-based classroom joining
   * Called when app loads with classroom code in URL
   */
  async handleURLClassroomJoin() {
    const urlParams = new URLSearchParams(window.location.search);
    const classroomCode =
      urlParams.get("join") ||
      urlParams.get("classroom") ||
      urlParams.get("code");

    if (classroomCode) {
      logger.info(
        "ClassroomIntegrationManager",
        "URL classroom join detected",
        {
          classroom_code: classroomCode,
        },
      );

      // Automatically open join dialog with prefilled code
      setTimeout(() => {
        this.handleJoinClassroom();
      }, 1000); // Small delay to ensure UI is ready
    }
  }

  /**
   * Show success message to user
   */
  showSuccessMessage(message) {
    // This would integrate with the existing toast system
    console.log("✅ Success:", message);
  }

  /**
   * Show error message to user
   */
  showErrorMessage(message) {
    // This would integrate with the existing toast system
    console.log("❌ Error:", message);
  }

  /**
   * Show info message to user
   */
  showInfoMessage(message) {
    // This would integrate with the existing toast system
    console.log("ℹ️ Info:", message);
  }

  /**
   * Cleanup method
   */
  cleanup() {
    this.teacherModals?.cleanup();
    this.studentModals?.cleanup();

    // Remove auth state listener if attached
    try {
      if (this._onAuthStateChanged) {
        eventDispatcher.off(
          AUTH_EVENTS.AUTH_STATE_CHANGED,
          this._onAuthStateChanged,
        );
      }
      if (this._onUserSignedOut) {
        eventDispatcher.off(AUTH_EVENTS.USER_SIGNED_OUT, this._onUserSignedOut);
      }
    } catch (_) {
      // ignore
    }
    this._onAuthStateChanged = null;
    this._onUserSignedOut = null;

    this.initialized = false;
    logger.info("ClassroomIntegrationManager", "Cleanup completed");
  }
}

// Export for use in app initialization
export default ClassroomIntegrationManager;
