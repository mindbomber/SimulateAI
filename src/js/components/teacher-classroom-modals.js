/**
 * Teacher Classroom Modal Components
 * Handles teacher-side classroom creation, management, and live session control
 * @class TeacherClassroomModals
 * @author SimulateAI Development Team
 * @since 1.80.0
 */

import ModalUtility from "./modal-utility.js";
import RealtimeClassroomService from "../services/realtime-classroom-service.js";
import { CLASSROOM_CONSTANTS } from "../constants/classroom-constants.js";
import {
  generateClassroomShareUrl,
  sanitizeClassroomName,
  logClassroomEvent,
} from "../utils/classroom-utils.js";
import logger from "../utils/logger.js";
import { ETHICAL_CATEGORIES } from "../../data/categories.js";

export default class TeacherClassroomModals {
  constructor(dataHandler, firebaseService) {
    this.dataHandler = dataHandler;
    this.firebaseService = firebaseService;
    this.classroomService = new RealtimeClassroomService(firebaseService);

    // State management
    this.currentClassroom = null;
    this.currentInstructor = null;
    this.availableScenarios = [];
    this.selectedScenarios = [];
    this.activeListeners = [];
    this.currentRoster = {};
    this._lastRoster = {};

    // Modal instances
    this.createClassroomModal = null;
    this.classroomCodeModal = null;
    this.liveSessionModal = null;

    // Prevent infinite loop flags
    this.updateInProgress = false;
    this.lastUpdateTime = 0;

    // Create debounced update function
    this.debouncedUpdateDisplay = this.debounce(
      this.updateSelectedScenariosDisplay.bind(this),
      150,
    );

    this.initialized = false;
  }

  /**
   * Debounce utility to prevent rapid successive calls
   * @private
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Initialize teacher classroom modals
   * @param {boolean} isGuestMode - Whether initializing in guest mode
   */
  async initialize(isGuestMode = false) {
    if (this.initialized) return;

    try {
      // Get current user as instructor (or use guest mode)
      if (isGuestMode) {
        // Create a temporary guest instructor object
        this.currentInstructor = {
          uid: `guest_instructor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          displayName: "Guest Instructor",
          email: null,
          isGuest: true,
        };
        logger.info("TeacherClassroomModals", "Initialized in guest mode");
      } else {
        this.currentInstructor = await this.firebaseService.getCurrentUser();
        if (!this.currentInstructor) {
          throw new Error("User must be authenticated to create classrooms");
        }
        logger.info(
          "TeacherClassroomModals",
          "Initialized with authenticated user",
        );
      }

      // Load available scenarios
      await this.loadAvailableScenarios();

      this.initialized = true;
      logger.info("TeacherClassroomModals", "Initialized successfully", {
        guestMode: isGuestMode,
      });
    } catch (error) {
      logger.error("TeacherClassroomModals", "Initialization failed", error);
      throw error;
    }
  }

  /**
   * Show create classroom modal
   * @param {boolean} isGuestMode - Whether to show modal in guest mode
   */
  async showCreateClassroomModal(isGuestMode = false) {
    try {
      await this.initialize(isGuestMode);

      const modalContent = this.buildCreateClassroomContent(isGuestMode);

      const modalTitle = isGuestMode
        ? "🏫 Create Classroom (Guest Mode)"
        : "🏫 Create Classroom";

      this.createClassroomModal = new ModalUtility({
        title: modalTitle,
        content: modalContent,
        size: "large",
        className: "teacher-create-classroom-modal",
        onClose: () => this.handleCreateClassroomClose(),
      });

      this.createClassroomModal.open();
      this.setupCreateClassroomEvents();

      logClassroomEvent("create_classroom_modal_opened", {
        instructor_id: this.currentInstructor.uid,
      });
    } catch (error) {
      logger.error(
        "TeacherClassroomModals",
        "Failed to show create classroom modal",
        error,
      );
      this.showErrorToast("Failed to open classroom creation dialog");
    }
  }

  /**
   * Build create classroom modal content
   * @param {boolean} isGuestMode - Whether building content for guest mode
   */
  buildCreateClassroomContent(isGuestMode = false) {
    const guestNotice = isGuestMode
      ? `
      <div class="guest-mode-notice">
        <div class="notice-content">
          <i class="fas fa-info-circle"></i>
          <strong>Guest Mode:</strong> You're creating a temporary classroom. Features are limited and data won't be saved permanently.
        </div>
      </div>
    `
      : "";

    return `
      ${guestNotice}
      <div class="classroom-creation-form">
        <!-- Classroom Information -->
        <div class="form-section">
          <h3>📋 Classroom Information</h3>
          
          <div class="form-group">
            <label for="classroom-name" class="required">Classroom Name</label>
            <input 
              type="text" 
              id="classroom-name" 
              name="classroom-name"
              placeholder="e.g., AI Ethics 101 - Spring 2025"
              maxlength="${CLASSROOM_CONSTANTS.CLASSROOM_NAME_MAX_LENGTH}"
              required
              autocomplete="off"
            />
            <small class="helper-text">Enter a descriptive name for your classroom session</small>
          </div>

          <div class="form-group">
            <label for="instructor-name">Instructor Name</label>
            <input 
              type="text" 
              id="instructor-name" 
              name="instructor-name"
              value="${this.currentInstructor?.displayName || ""}"
              placeholder="Your name as it will appear to students"
              maxlength="100"
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label for="session-date">Session Date</label>
            <input 
              type="datetime-local" 
              id="session-date" 
              name="session-date"
              value="${new Date().toISOString().slice(0, 16)}"
            />
            <small class="helper-text">Optional: Schedule the session for a specific time</small>
          </div>
        </div>

        <!-- Scenario Selection -->
        <div class="form-section">
          <h3>🎯 Scenario Selection</h3>
          <p class="section-description">
            Choose scenarios that students will experience during the live session. 
            Students will progress through scenarios in the order you select.
          </p>
          
          <div class="scenario-selection-container">
            <div class="categories-list">
              ${this.buildCategoriesContent()}
            </div>
            
            <div class="selected-scenarios">
              <h4>📝 Selected Scenarios (${this.selectedScenarios.length})</h4>
              <div class="selected-list" id="selected-scenarios-list">
                ${this.buildSelectedScenariosContent()}
              </div>
            </div>
          </div>
        </div>

        <!-- Classroom Settings -->
        <div class="form-section">
          <h3>⚙️ Settings</h3>
          
          <div class="settings-grid">
            <div class="form-group">
              <label for="max-students">Maximum Students</label>
              <select id="max-students" name="max-students">
                <option value="10">10 students</option>
                <option value="20">20 students</option>
                <option value="30" selected>30 students</option>
                <option value="50">50 students</option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="allow-late-joining" checked />
                <span class="checkmark"></span>
                Allow students to join after session starts
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" id="show-progress" checked />
                <span class="checkmark"></span>
                Show real-time progress to instructor
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancel-create-classroom">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" id="create-classroom-submit" disabled>
            <span class="btn-icon">🏫</span>
            Create Classroom
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Build categories content with expandable scenario lists
   */
  buildCategoriesContent() {
    const categories = this.groupScenariosByCategory();

    return Object.entries(categories)
      .map(([categoryName, scenarios]) => {
        // Get category icon from first scenario in the category
        const categoryIcon = scenarios[0]?.categoryIcon || "🤖";

        return `
      <div class="category-group" data-category="${categoryName}">
        <div class="category-header" tabindex="0" role="button" aria-expanded="false">
          <h5><span class="category-icon">${categoryIcon}</span> ${categoryName}</h5>
          <span class="expand-icon">▶</span>
          <span class="scenario-count">${scenarios.length} scenarios</span>
        </div>
        <div class="category-scenarios" style="display: none;">
          ${scenarios
            .map(
              (scenario) => `
            <div class="scenario-item" data-scenario-id="${scenario.id}">
              <div class="scenario-info">
                <h6>${scenario.title}</h6>
                <p>${scenario.description || "AI ethics scenario focusing on decision-making"}</p>
                <div class="scenario-meta">
                  <span class="difficulty ${scenario.difficulty}">${scenario.difficulty || "intermediate"}</span>
                  <span class="estimated-time">${scenario.estimatedTime || "5-10 min"}</span>
                </div>
              </div>
              <div class="scenario-actions">
                <button class="btn btn-sm btn-outline preview-scenario" data-scenario-id="${scenario.id}">
                  👁️ Preview
                </button>
                <button class="btn btn-sm btn-primary add-scenario" data-scenario-id="${scenario.id}">
                  ➕ Add
                </button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
      })
      .join("");
  }

  /**
   * Build selected scenarios content with reordering
   */
  buildSelectedScenariosContent() {
    if (this.selectedScenarios.length === 0) {
      return `
        <div class="empty-selection">
          <p>No scenarios selected yet. Choose scenarios from the categories above.</p>
        </div>
      `;
    }

    return this.selectedScenarios
      .map(
        (scenario, index) => `
      <div class="selected-scenario-item" data-scenario-id="${scenario.id}" data-order="${index}">
        <div class="drag-handle">⋮⋮</div>
        <div class="scenario-info">
          <span class="order-number">${index + 1}.</span>
          <span class="scenario-title">${scenario.title}</span>
          <span class="scenario-category">${scenario.category}</span>
        </div>
        <div class="scenario-actions">
          <button class="btn btn-sm btn-outline move-up" ${index === 0 ? "disabled" : ""}>
            ↑
          </button>
          <button class="btn btn-sm btn-outline move-down" ${index === this.selectedScenarios.length - 1 ? "disabled" : ""}>
            ↓
          </button>
          <button class="btn btn-sm btn-danger remove-scenario">
            ✕
          </button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  /**
   * Setup event listeners for create classroom modal
   */
  setupCreateClassroomEvents() {
    if (!this.createClassroomModal?.element) return;

    const modal = this.createClassroomModal.element;

    // Form validation
    const classroomNameInput = modal.querySelector("#classroom-name");
    const submitButton = modal.querySelector("#create-classroom-submit");

    classroomNameInput?.addEventListener("input", () => {
      this.validateCreateClassroomForm();
    });

    // Category expansion
    modal.querySelectorAll(".category-header").forEach((header) => {
      header.addEventListener("click", this.handleCategoryToggle.bind(this));
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleCategoryToggle(e);
        }
      });
    });

    // Scenario actions
    modal.querySelectorAll(".add-scenario").forEach((button) => {
      button.addEventListener("click", this.handleAddScenario.bind(this));
    });

    modal.querySelectorAll(".preview-scenario").forEach((button) => {
      button.addEventListener("click", this.handlePreviewScenario.bind(this));
    });

    // Selected scenarios actions
    modal.querySelectorAll(".remove-scenario").forEach((button) => {
      button.addEventListener("click", this.handleRemoveScenario.bind(this));
    });

    modal.querySelectorAll(".move-up").forEach((button) => {
      button.addEventListener("click", this.handleMoveScenarioUp.bind(this));
    });

    modal.querySelectorAll(".move-down").forEach((button) => {
      button.addEventListener("click", this.handleMoveScenarioDown.bind(this));
    });

    // Form submission
    submitButton?.addEventListener(
      "click",
      this.handleCreateClassroomSubmit.bind(this),
    );

    modal
      .querySelector("#cancel-create-classroom")
      ?.addEventListener("click", () => {
        this.createClassroomModal.close();
      });
  }

  /**
   * Handle category toggle (expand/collapse)
   */
  handleCategoryToggle(event) {
    const header = event.currentTarget;
    const categoryGroup = header.closest(".category-group");
    const scenarios = categoryGroup.querySelector(".category-scenarios");
    const expandIcon = header.querySelector(".expand-icon");

    const isExpanded = header.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      scenarios.style.display = "none";
      expandIcon.textContent = "▶";
      header.setAttribute("aria-expanded", "false");
    } else {
      scenarios.style.display = "block";
      expandIcon.textContent = "▼";
      header.setAttribute("aria-expanded", "true");
    }
  }

  /**
   * Handle adding scenario to selection
   */
  handleAddScenario(event) {
    // Prevent rapid-fire clicks that could cause infinite loops
    if (this.updateInProgress) {
      return;
    }

    const scenarioId = event.currentTarget.dataset.scenarioId;
    const scenario = this.findScenarioById(scenarioId);

    if (!scenario) {
      logger.warn("TeacherClassroomModals", "Scenario not found", {
        scenarioId,
      });
      return;
    }

    // Check if already selected
    if (this.selectedScenarios.find((s) => s.id === scenarioId)) {
      this.showWarningToast("Scenario already selected");
      return;
    }

    // Check maximum scenarios
    if (
      this.selectedScenarios.length >=
      CLASSROOM_CONSTANTS.MAX_SCENARIOS_PER_SESSION
    ) {
      this.showWarningToast(
        `Maximum ${CLASSROOM_CONSTANTS.MAX_SCENARIOS_PER_SESSION} scenarios allowed`,
      );
      return;
    }

    // Set update flag to prevent infinite loops
    this.updateInProgress = true;

    try {
      // Add to selection
      this.selectedScenarios.push({
        ...scenario,
        order: this.selectedScenarios.length,
      });

      // Update UI with debounce
      this.debouncedUpdateDisplay();
      this.validateCreateClassroomForm();

      // Update button state
      event.currentTarget.textContent = "✓ Added";
      event.currentTarget.disabled = true;
      event.currentTarget.className = "btn btn-sm btn-success";

      logClassroomEvent("scenario_added", {
        scenario_id: scenarioId,
        selection_count: this.selectedScenarios.length,
      });
    } finally {
      // Clear update flag after a short delay
      setTimeout(() => {
        this.updateInProgress = false;
      }, 100);
    }
  }

  /**
   * Handle removing scenario from selection
   */
  handleRemoveScenario(event) {
    // Prevent rapid-fire clicks that could cause infinite loops
    if (this.updateInProgress) {
      return;
    }

    const scenarioItem = event.currentTarget.closest(".selected-scenario-item");
    const scenarioId = scenarioItem.dataset.scenarioId;

    // Set update flag
    this.updateInProgress = true;

    try {
      // Remove from selection
      this.selectedScenarios = this.selectedScenarios.filter(
        (s) => s.id !== scenarioId,
      );

      // Update orders
      this.selectedScenarios.forEach((scenario, index) => {
        scenario.order = index;
      });

      // Update UI with debounce
      this.debouncedUpdateDisplay();
      this.validateCreateClassroomForm();

      // Re-enable add button
      const addButton = this.createClassroomModal.element.querySelector(
        `.add-scenario[data-scenario-id="${scenarioId}"]`,
      );
      if (addButton) {
        addButton.textContent = "➕ Add";
        addButton.disabled = false;
        addButton.className = "btn btn-sm btn-primary add-scenario";
      }

      logClassroomEvent("scenario_removed", {
        scenario_id: scenarioId,
        selection_count: this.selectedScenarios.length,
      });
    } finally {
      // Clear update flag after a short delay
      setTimeout(() => {
        this.updateInProgress = false;
      }, 100);
    }
  }

  /**
   * Handle previewing scenario
   */
  handlePreviewScenario(event) {
    const scenarioId = event.currentTarget.dataset.scenarioId;
    const scenario = this.findScenarioById(scenarioId);

    if (!scenario) {
      logger.warn("TeacherClassroomModals", "Scenario not found for preview", {
        scenarioId,
      });
      return;
    }

    try {
      // Find the category for this scenario using the categoryId from our data
      const categoryId = scenario.categoryId;

      // Log the preview action
      logClassroomEvent("scenario_previewed", {
        scenario_id: scenarioId,
        category_id: categoryId,
        source: "classroom_creation_modal",
      });

      // Check if window.app and its methods are available
      if (
        window.app &&
        window.app.categoryGrid &&
        window.app.categoryGrid.openScenarioModalDirect
      ) {
        // Use the direct scenario modal launch to skip pre-launch modal
        logger.info(
          "TeacherClassroomModals",
          "Launching scenario preview directly via openScenarioModalDirect",
          {
            scenarioId,
            categoryId,
          },
        );

        window.app.categoryGrid.openScenarioModalDirect(categoryId, scenarioId);
      } else if (
        window.app &&
        window.app.categoryGrid &&
        window.app.categoryGrid.openScenarioModal
      ) {
        // Fallback to openScenarioModal method (also direct)
        logger.info(
          "TeacherClassroomModals",
          "Launching scenario preview via openScenarioModal",
          {
            scenarioId,
            categoryId,
          },
        );

        window.app.categoryGrid.openScenarioModal(scenarioId, categoryId);
      } else {
        // Fallback to alert if app is not available
        logger.warn(
          "TeacherClassroomModals",
          "App not available for preview, showing alert",
        );

        alert(
          `Preview: ${scenario.title}\n\nCategory: ${scenario.category}\nDescription: ${scenario.description}\n\nThis scenario would normally launch directly in the simulation environment.`,
        );
      }
    } catch (error) {
      logger.error(
        "TeacherClassroomModals",
        "Failed to preview scenario",
        error,
      );

      // Fallback alert on error
      alert(
        `Error previewing scenario: ${scenario.title}\n\nPlease try again.`,
      );
    }
  }

  /**
   * Validate create classroom form
   */
  validateCreateClassroomForm() {
    const modal = this.createClassroomModal?.element;
    if (!modal) return false;

    const classroomName = modal.querySelector("#classroom-name")?.value?.trim();
    const submitButton = modal.querySelector("#create-classroom-submit");

    const isValid =
      classroomName &&
      classroomName.length >= CLASSROOM_CONSTANTS.CLASSROOM_NAME_MIN_LENGTH &&
      this.selectedScenarios.length >=
        CLASSROOM_CONSTANTS.MIN_SCENARIOS_PER_SESSION;

    if (submitButton) {
      submitButton.disabled = !isValid;
    }

    return isValid;
  }

  /**
   * Handle create classroom form submission
   */
  async handleCreateClassroomSubmit() {
    try {
      console.log("🔥 handleCreateClassroomSubmit called");
      console.log("Current instructor:", this.currentInstructor);
      console.log("Selected scenarios:", this.selectedScenarios);

      if (!this.validateCreateClassroomForm()) {
        console.log("❌ Form validation failed");
        this.showErrorToast(
          "Please complete all required fields and select at least one scenario",
        );
        return;
      }

      console.log("✅ Form validation passed");

      const modal = this.createClassroomModal.element;
      const formData = {
        classroomName: sanitizeClassroomName(
          modal.querySelector("#classroom-name").value,
        ),
        instructorName:
          modal.querySelector("#instructor-name").value ||
          this.currentInstructor.displayName,
        maxStudents: parseInt(modal.querySelector("#max-students").value),
        allowLateJoining: modal.querySelector("#allow-late-joining").checked,
        showProgress: modal.querySelector("#show-progress").checked,
        sessionDate: new Date().toISOString(), // Use current date since no date field exists
        selectedScenarios: this.selectedScenarios.map((scenario, index) => ({
          scenarioId: scenario.id,
          title: scenario.title,
          category: scenario.category,
          order: index,
        })),
      };

      console.log("📋 Form data prepared:", formData);

      // Show loading state
      const submitButton = modal.querySelector("#create-classroom-submit");
      submitButton.innerHTML =
        '<span class="loading-spinner"></span> Creating...';
      submitButton.disabled = true;

      console.log("🔄 Calling classroomService.createClassroom...");

      // Create classroom
      const classroomData = {
        classroomName: formData.classroomName,
        instructorId: this.currentInstructor.uid,
        instructorName: formData.instructorName,
        selectedScenarios: formData.selectedScenarios,
      };

      console.log("🏫 Classroom data for service:", classroomData);

      const result = await this.classroomService.createClassroom(classroomData);

      console.log("✅ Classroom creation successful:", result);

      // Store current classroom
      this.currentClassroom = result;

      // Close create modal and show code modal
      this.createClassroomModal.close();
      this.showClassroomCodeModal(result);

      logClassroomEvent("classroom_created", {
        classroom_code: result.classroomCode,
        scenario_count: formData.selectedScenarios.length,
        max_students: formData.maxStudents,
      });
    } catch (error) {
      console.error("❌ handleCreateClassroomSubmit error:", error);
      logger.error(
        "TeacherClassroomModals",
        "Failed to create classroom",
        error,
      );
      this.showErrorToast("Failed to create classroom: " + error.message);

      // Reset button
      const submitButton = this.createClassroomModal.element.querySelector(
        "#create-classroom-submit",
      );
      if (submitButton) {
        submitButton.innerHTML =
          '<span class="btn-icon">🏫</span> Create Classroom';
        submitButton.disabled = false;
      }
    }
  }

  /**
   * Show classroom code modal with roster
   */
  showClassroomCodeModal(classroom) {
    const modalContent = this.buildClassroomCodeContent(classroom);

    this.classroomCodeModal = new ModalUtility({
      title: "📋 Classroom Created Successfully!",
      content: modalContent,
      size: "large",
      className: "teacher-classroom-code-modal",
      closeOnBackdrop: false,
      onClose: () => this.handleClassroomCodeClose(),
    });

    this.classroomCodeModal.open();
    this.setupClassroomCodeEvents(classroom);
    this.startRosterListener(classroom.classroomCode);
  }

  /**
   * Build classroom code modal content
   */
  buildClassroomCodeContent(classroom) {
    generateClassroomShareUrl(classroom.classroomCode); // Generate for later use

    return `
      <div class="classroom-code-container">
        <!-- Classroom Information -->
        <div class="classroom-info">
          <h3>${classroom.classroomName}</h3>
          <p>Instructor: ${classroom.instructorName}</p>
          <p>Scenarios: ${classroom.selectedScenarios.length}</p>
        </div>

        <!-- Classroom Code Display -->
        <div class="code-display-section">
          <h4>🔗 Student Join Code</h4>
          <div class="classroom-code-display">
            <span class="code-text" id="classroom-code-text">${classroom.classroomCode}</span>
            <button class="btn btn-outline copy-code-btn" id="copy-classroom-code" title="Copy to clipboard">
              📋 Copy
            </button>
          </div>
          <p class="code-instructions">
            Share this code with your students so they can join the classroom.
          </p>
        </div>

        <!-- Share Options -->
        <div class="share-options">
          <h4>📤 Share Options</h4>
          <div class="share-buttons">
            <button class="btn btn-outline" id="copy-share-url">
              🔗 Copy Link
            </button>
            <button class="btn btn-outline" id="share-qr-code">
              📱 QR Code
            </button>
            <button class="btn btn-outline" id="email-invitation">
              ✉️ Email Invitation
            </button>
          </div>
        </div>

        <!-- Student Roster -->
        <div class="student-roster-section">
          <h4>👥 Student Roster <span class="student-count" id="student-count">(0 students)</span></h4>
          <div class="roster-container" id="roster-container">
            <div class="empty-roster">
              <p>No students have joined yet. Share the classroom code above.</p>
            </div>
          </div>
        </div>

        <!-- Session Controls -->
        <div class="session-controls">
          <div class="control-buttons">
            <button class="btn btn-secondary" id="close-classroom">
              Close Classroom
            </button>
            <button class="btn btn-success" id="start-live-session" disabled>
              🔴 Start Live Session
            </button>
          </div>
          <p class="session-note">
            <em>Students must join before you can start the live session.</em>
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Load available scenarios from categories
   */
  async loadAvailableScenarios() {
    try {
      // Load scenarios from the real categories data
      this.availableScenarios = [];

      // Extract all scenarios from ETHICAL_CATEGORIES
      Object.entries(ETHICAL_CATEGORIES).forEach(
        ([categoryId, categoryData]) => {
          if (categoryData.scenarios && Array.isArray(categoryData.scenarios)) {
            categoryData.scenarios.forEach((scenario) => {
              this.availableScenarios.push({
                id: scenario.id,
                title: scenario.title,
                category: categoryData.title, // Use category title instead of id
                difficulty: scenario.difficulty || "intermediate",
                estimatedTime: scenario.estimatedTime || "5-10 min",
                description: scenario.description || scenario.title,
                categoryId: categoryId, // Keep original category id for reference
                categoryIcon: categoryData.icon || "🤖",
              });
            });
          }
        },
      );

      logger.info(
        "TeacherClassroomModals",
        "Real scenarios loaded from categories",
        {
          count: this.availableScenarios.length,
          categories: Object.keys(ETHICAL_CATEGORIES).length,
        },
      );
    } catch (error) {
      logger.error("TeacherClassroomModals", "Failed to load scenarios", error);
      this.availableScenarios = [];
    }
  }

  /**
   * Group scenarios by category
   */
  groupScenariosByCategory() {
    return this.availableScenarios.reduce((groups, scenario) => {
      const category = scenario.category || "Uncategorized";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(scenario);
      return groups;
    }, {});
  }

  /**
   * Find scenario by ID
   */
  findScenarioById(scenarioId) {
    return this.availableScenarios.find(
      (scenario) => scenario.id === scenarioId,
    );
  }

  /**
   * Update selected scenarios display
   */
  updateSelectedScenariosDisplay() {
    const container = this.createClassroomModal?.element?.querySelector(
      "#selected-scenarios-list",
    );
    if (container) {
      // Store scroll position
      const scrollTop = container.scrollTop;

      // Update content
      container.innerHTML = this.buildSelectedScenariosContent();

      // Restore scroll position
      container.scrollTop = scrollTop;

      // Remove all existing event listeners first to prevent duplicates
      const oldButtons = container.querySelectorAll(
        ".remove-scenario, .move-up, .move-down",
      );
      oldButtons.forEach((button) => {
        button.replaceWith(button.cloneNode(true));
      });

      // Re-attach event listeners with proper delegation
      this.attachSelectedScenarioEvents(container);
    }
  }

  /**
   * Attach event listeners to selected scenario buttons
   * @private
   */
  attachSelectedScenarioEvents(container) {
    // Use event delegation to prevent duplicate listeners
    container.removeEventListener("click", this.handleSelectedScenarioClick);
    container.addEventListener(
      "click",
      this.handleSelectedScenarioClick.bind(this),
    );
  }

  /**
   * Handle clicks on selected scenario elements (using delegation)
   * @private
   */
  handleSelectedScenarioClick(event) {
    const button = event.target.closest(
      ".remove-scenario, .move-up, .move-down",
    );
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    if (button.classList.contains("remove-scenario")) {
      this.handleRemoveScenario(event);
    } else if (button.classList.contains("move-up")) {
      this.handleMoveScenarioUp(event);
    } else if (button.classList.contains("move-down")) {
      this.handleMoveScenarioDown(event);
    }
  }

  /**
   * Start real-time roster listener
   */
  startRosterListener(classroomCode) {
    const unsubscribe = this.classroomService.listenToRoster(
      classroomCode,
      (roster) => {
        this._lastRoster = roster || {};
        this.updateRosterDisplay(roster);
      },
    );

    this.activeListeners.push({ name: "roster", unsubscribe });
  }

  /**
   * Update roster display
   */
  updateRosterDisplay(roster) {
    const rosterContainer =
      this.classroomCodeModal?.element?.querySelector("#roster-container");
    const studentCount =
      this.classroomCodeModal?.element?.querySelector("#student-count");
    const startButton = this.classroomCodeModal?.element?.querySelector(
      "#start-live-session",
    );

    if (!rosterContainer) return;

    const students = Object.entries(roster || {});

    // Update student count
    if (studentCount) {
      studentCount.textContent = `(${students.length} student${students.length !== 1 ? "s" : ""})`;
    }

    // Enable start button if students present
    if (startButton) {
      startButton.disabled = students.length === 0;
    }

    // Update roster display
    if (students.length === 0) {
      rosterContainer.innerHTML = `
        <div class="empty-roster">
          <p>No students have joined yet. Share the classroom code above.</p>
        </div>
      `;
    } else {
      rosterContainer.innerHTML = `
        <div class="student-list">
          ${students
            .map(
              ([studentId, student]) => `
            <div class="student-item ${student.isActive ? "active" : "inactive"}">
              <div class="student-avatar">
                ${student.nickname.charAt(0).toUpperCase()}
              </div>
              <div class="student-info">
                <span class="student-nickname">${student.nickname}</span>
                <span class="student-status">${student.isActive ? "Active" : "Inactive"}</span>
              </div>
              <div class="student-actions">
                <button class="btn btn-sm btn-outline remove-student" data-student-id="${studentId}">
                  Remove
                </button>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      `;

      // Add remove student listeners
      rosterContainer.querySelectorAll(".remove-student").forEach((button) => {
        button.addEventListener("click", (e) => {
          this.handleRemoveStudent(e.currentTarget.dataset.studentId);
        });
      });
    }
  }

  /**
   * Setup classroom code modal events
   */
  setupClassroomCodeEvents(classroom) {
    if (!this.classroomCodeModal?.element) return;

    const modal = this.classroomCodeModal.element;

    // Copy classroom code
    modal
      .querySelector("#copy-classroom-code")
      ?.addEventListener("click", () => {
        navigator.clipboard.writeText(classroom.classroomCode).then(() => {
          this.showSuccessToast("Classroom code copied to clipboard");
        });
      });

    // Copy share URL (with lightweight classroom seed to aid discovery)
    modal.querySelector("#copy-share-url")?.addEventListener("click", () => {
      const shareUrl = generateClassroomShareUrl(classroom.classroomCode, {
        seed: classroom,
      });
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.showSuccessToast("Share link copied to clipboard");
      });
    });

    // Start live session
    modal
      .querySelector("#start-live-session")
      ?.addEventListener("click", () => {
        this.startLiveSession(classroom);
      });

    // Close classroom
    modal.querySelector("#close-classroom")?.addEventListener("click", () => {
      this.handleCloseClassroom();
    });
  }

  /**
   * Start live session
   */
  async startLiveSession(classroom) {
    try {
      const instructorId = this.currentInstructor?.uid || "guest_instructor";
      await this.classroomService.startLiveSession(
        classroom.classroomCode,
        instructorId,
      );

      // Close code modal and show live session modal
      this.classroomCodeModal.close();
      this.showLiveSessionModal(classroom);

      logClassroomEvent("session_started", {
        classroom_code: classroom.classroomCode,
        student_count: Object.keys(classroom.roster || {}).length,
      });
    } catch (error) {
      logger.error(
        "TeacherClassroomModals",
        "Failed to start live session",
        error,
      );
      this.showErrorToast("Failed to start session: " + error.message);
    }
  }

  /**
   * Show live session control modal
   */
  showLiveSessionModal(classroom) {
    const modalContent = this.buildLiveSessionContent(classroom);

    this.liveSessionModal = new ModalUtility({
      title: `🔴 Live Session: ${classroom.classroomName}`,
      content: modalContent,
      size: "large",
      className: "teacher-live-session-modal",
      closeOnBackdrop: false,
      onClose: () => this.handleLiveSessionClose(),
    });

    this.liveSessionModal.open();
    // Ensure tabs work and non-active panels are hidden initially
    this.setupTabNavigation();
    this.setupLiveSessionEvents(classroom);
    this.startLiveSessionListeners(classroom.classroomCode);
  }

  /**
   * Setup live session event handlers (pause/resume/export/complete)
   */
  setupLiveSessionEvents(classroom) {
    const modal = this.liveSessionModal?.element;
    if (!modal) return;

    const pauseBtn = modal.querySelector("#pause-session");
    const resumeBtn = modal.querySelector("#resume-session");
    const completeBtn = modal.querySelector("#complete-session");
    const exportBtn = modal.querySelector("#export-data");

    pauseBtn?.addEventListener("click", async () => {
      try {
        await this.classroomService.pauseSession(classroom.classroomCode, true);
        pauseBtn.style.display = "none";
        resumeBtn.style.display = "inline-block";
      } catch (e) {
        this.showErrorToast("Failed to pause session");
      }
    });

    resumeBtn?.addEventListener("click", async () => {
      try {
        await this.classroomService.pauseSession(
          classroom.classroomCode,
          false,
        );
        resumeBtn.style.display = "none";
        pauseBtn.style.display = "inline-block";
      } catch (e) {
        this.showErrorToast("Failed to resume session");
      }
    });

    completeBtn?.addEventListener("click", async () => {
      try {
        await this.classroomService.completeSession(classroom.classroomCode);
        this.liveSessionModal?.close();
        this.showSuccessToast("Session completed");
      } catch (e) {
        this.showErrorToast("Failed to complete session");
      }
    });

    exportBtn?.addEventListener("click", () => {
      // Placeholder export; can be wired to real data export later
      this.showInfoToast("Exporting session data...");
    });
  }

  /**
   * Initialize tab navigation for the live session modal
   * - Adds click handlers to tab buttons
   * - Shows only the active tab panel
   */
  setupTabNavigation() {
    const modal = this.liveSessionModal?.element;
    if (!modal) return;

    const buttons = Array.from(
      modal.querySelectorAll(".tab-navigation .tab-button"),
    );
    const panels = Array.from(
      modal.querySelectorAll(".tab-content .tab-panel"),
    );

    const showTab = (tabName) => {
      // Toggle button active state and aria-selected
      buttons.forEach((btn) => {
        const isActive = btn.dataset.tab === tabName;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });

      // Toggle panel visibility and active class
      panels.forEach((panel) => {
        const isActive = panel.id === `${tabName}-tab`;
        panel.classList.toggle("active", isActive);
        // Ensure only active panel is visible even without CSS support
        if (isActive) {
          panel.removeAttribute("hidden");
          panel.style.display = "";
        } else {
          panel.setAttribute("hidden", "");
          panel.style.display = "none";
        }
      });
    };

    // Attach handlers (once per open)
    buttons.forEach((btn) => {
      // Set a guard to prevent duplicate listeners across reopens
      if (!btn.__tabHandlerBound) {
        btn.addEventListener("click", () => showTab(btn.dataset.tab));
        btn.__tabHandlerBound = true;
      }
      // A11y roles
      btn.setAttribute("role", "tab");
    });

    // Initialize tablist/tabpanel a11y and hide non-active panels
    const tabNav = modal.querySelector(".tab-navigation");
    if (tabNav) tabNav.setAttribute("role", "tablist");
    panels.forEach((panel) => {
      panel.setAttribute("role", "tabpanel");
      if (!panel.classList.contains("active")) {
        panel.setAttribute("hidden", "");
        panel.style.display = "none";
      }
    });

    // Ensure a default active tab (details) is shown
    const defaultBtn =
      buttons.find((b) => b.classList.contains("active")) || buttons[0];
    if (defaultBtn) showTab(defaultBtn.dataset.tab);
  }

  /**
   * Start live session listeners for status, roster, and choices
   */
  startLiveSessionListeners(classroomCode) {
    const modal = this.liveSessionModal?.element;
    if (!modal) return;

    const statusEl = modal.querySelector("#session-status");
    const countEl = modal.querySelector("#live-student-count");
    const durationEl = modal.querySelector("#session-duration");

    let startTimeMs = null;

    const formatDuration = (ms) => {
      if (!ms || ms < 0) return "00:00";
      const totalSec = Math.floor(ms / 1000);
      const m = String(Math.floor(totalSec / 60)).padStart(2, "0");
      const s = String(totalSec % 60).padStart(2, "0");
      return `${m}:${s}`;
    };

    // Session status listener
    const statusUnsub = this.classroomService.listenToSessionStatus(
      classroomCode,
      (status) => {
        // Update UI
        if (status?.isLive) {
          statusEl?.classList.add("live");
          statusEl && (statusEl.textContent = "🔴 LIVE");
          startTimeMs = status.startTime || startTimeMs || Date.now();
        } else if (status?.isPaused) {
          statusEl?.classList.remove("live");
          statusEl && (statusEl.textContent = "⏸️ PAUSED");
        } else {
          statusEl?.classList.remove("live");
          statusEl && (statusEl.textContent = "⏳ WAITING");
        }
      },
    );
    this.activeListeners.push({
      name: "live_status",
      unsubscribe: statusUnsub,
    });

    // Roster listener for count
    const rosterUnsub = this.classroomService.listenToRoster(
      classroomCode,
      (roster) => {
        const count = Object.keys(roster || {}).length;
        countEl && (countEl.textContent = String(count));
        this.currentRoster = roster || {};
      },
    );
    this.activeListeners.push({
      name: "live_roster",
      unsubscribe: rosterUnsub,
    });

    // Duration ticker
    const intervalId = setInterval(() => {
      if (startTimeMs != null) {
        durationEl &&
          (durationEl.textContent = formatDuration(Date.now() - startTimeMs));
      }
    }, 1000);
    this.activeListeners.push({
      name: "live_duration",
      unsubscribe: () => clearInterval(intervalId),
    });

    // Student choices/progress listener for Overview & Choices tabs
    const choicesUnsub = this.classroomService.listenToStudentChoices(
      classroomCode,
      (studentChoices) => {
        try {
          this.renderOverviewProgress(studentChoices);
          this.renderChoicesGrid(studentChoices);
        } catch (e) {
          logger.debug(
            "TeacherClassroomModals",
            "render live choices/progress failed",
            e,
          );
        }
      },
    );
    this.activeListeners.push({
      name: "live_choices",
      unsubscribe: choicesUnsub,
    });
  }

  /**
   * Resolve a studentId to a display nickname using current roster
   */
  lookupNickname(studentId) {
    return this.currentRoster?.[studentId]?.nickname || studentId;
  }

  /**
   * Build live session modal content with tabs
   */
  buildLiveSessionContent(classroom) {
    return `
      <div class="live-session-container">
        <!-- Session Status Bar -->
        <div class="session-status-bar">
          <div class="status-item">
            <span class="status-label">Status:</span>
            <span class="status-value live" id="session-status">🔴 LIVE</span>
          </div>
          <div class="status-item">
            <span class="status-label">Students:</span>
            <span class="status-value" id="live-student-count">0</span>
          </div>
          <div class="status-item">
            <span class="status-label">Duration:</span>
            <span class="status-value" id="session-duration">00:00</span>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button class="tab-button active" data-tab="details">📋 Details</button>
          <button class="tab-button" data-tab="overview">📊 Overview</button>
          <button class="tab-button" data-tab="choices">👁️ Choices</button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Details Tab -->
          <div class="tab-panel active" id="details-tab">
            ${this.buildDetailsTabContent(classroom)}
          </div>

          <!-- Overview Tab -->
          <div class="tab-panel" id="overview-tab">
            ${this.buildOverviewTabContent(classroom)}
          </div>

          <!-- Choices Tab -->
          <div class="tab-panel" id="choices-tab">
            ${this.buildChoicesTabContent(classroom)}
          </div>
        </div>

        <!-- Session Controls -->
        <div class="session-control-bar">
          <div class="control-group">
            <button class="btn btn-warning" id="pause-session">
              ⏸️ Pause Session
            </button>
            <button class="btn btn-success" id="resume-session" style="display: none;">
              ▶️ Resume Session
            </button>
          </div>
          <div class="control-group">
            <button class="btn btn-outline" id="export-data">
              📤 Export Data
            </button>
            <button class="btn btn-danger" id="complete-session">
              ✅ Complete Session
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Build details tab content
   */
  buildDetailsTabContent(classroom) {
    return `
      <div class="details-content">
        <div class="classroom-overview">
          <h4>Classroom Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span>${classroom.classroomName}</span>
            </div>
            <div class="info-item">
              <label>Code:</label>
              <span class="classroom-code">${classroom.classroomCode}</span>
            </div>
            <div class="info-item">
              <label>Instructor:</label>
              <span>${classroom.instructorName}</span>
            </div>
            <div class="info-item">
              <label>Scenarios:</label>
              <span>${classroom.selectedScenarios.length}</span>
            </div>
          </div>
        </div>

        <div class="scenario-sequence">
          <h4>Scenario Sequence</h4>
          <div class="scenario-list">
            ${classroom.selectedScenarios
              .map(
                (scenario, index) => `
              <div class="scenario-sequence-item">
                <span class="sequence-number">${index + 1}</span>
                <div class="scenario-details">
                  <h6>${scenario.title}</h6>
                  <span class="scenario-category">${scenario.category}</span>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <div class="quick-stats">
          <h4>Quick Stats</h4>
          <div class="stats-grid" id="live-stats-grid">
            <!-- Updated by real-time listeners -->
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">Active Students</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0%</span>
              <span class="stat-label">Avg Progress</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Build overview tab content
   */
  buildOverviewTabContent() {
    return `
      <div class="overview-content">
        <div class="progress-overview">
          <h4>Student Progress Overview</h4>
          <div class="progress-visualization" id="progress-visualization">
            <!-- Real-time progress charts would go here -->
            <div class="progress-placeholder">
              <p>Real-time progress data will appear here once students begin.</p>
            </div>
          </div>
        </div>

        <div class="student-grid" id="student-progress-grid">
          <!-- Updated by real-time listeners -->
        </div>
      </div>
    `;
  }

  /**
   * Build choices tab content
   */
  buildChoicesTabContent(classroom) {
    return `
      <div class="choices-content">
        <div class="choices-header">
          <h4>Student Choice Monitoring</h4>
          <div class="choice-filters">
            <select id="scenario-filter">
              <option value="">All Scenarios</option>
              ${classroom.selectedScenarios
                .map(
                  (scenario) => `
                <option value="${scenario.scenarioId}">${scenario.title}</option>
              `,
                )
                .join("")}
            </select>
            <select id="choice-filter">
              <option value="">All Choices</option>
              <option value="completed">Completed Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>

        <div class="choices-grid" id="student-choices-grid">
          <!-- Updated by real-time listeners -->
          <div class="choices-placeholder">
            <p>Student choices will appear here as they make decisions.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Overview tab progress grid based on studentChoices
   * @param {Object} studentChoices
   */
  renderOverviewProgress(studentChoices = {}) {
    const container = this.liveSessionModal?.element?.querySelector(
      "#student-progress-grid",
    );
    const progressVis = this.liveSessionModal?.element?.querySelector(
      "#progress-visualization",
    );
    if (!container) return;

    const entries = Object.entries(studentChoices || {});

    if (entries.length === 0) {
      container.innerHTML = `
        <div class="progress-empty"><p>No student progress yet.</p></div>
      `;
      return;
    }

    // Build simple cards showing per-student completion
    const totalScenarios = (this.currentClassroom?.selectedScenarios || [])
      .length;
    const cards = entries
      .map(([studentId, data]) => {
        const nickname = this.lookupNickname(studentId);
        const completed =
          (data?.overallProgress?.completed != null
            ? data.overallProgress.completed
            : Object.keys(data?.scenarios || {}).length) || 0;
        const total =
          (data?.overallProgress?.total != null
            ? data.overallProgress.total
            : totalScenarios) || 0;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return `
          <div class="student-progress-card">
            <div class="spc-header">
              <div class="avatar">${nickname.charAt(0).toUpperCase()}</div>
              <div class="meta">
                <div class="name">${nickname}</div>
                <div class="progress-text">${completed}/${total} (${percent}%)</div>
              </div>
            </div>
            <div class="spc-bar">
              <div class="spc-bar-fill" style="width:${percent}%"></div>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `<div class="spc-grid">${cards}</div>`;

    // Update placeholder in visualization area with a simple aggregate bar
    if (progressVis) {
      const totals = entries.reduce(
        (acc, [, d]) => {
          const comp =
            (d?.overallProgress?.completed != null
              ? d.overallProgress.completed
              : Object.keys(d?.scenarios || {}).length) || 0;
          const tot =
            (d?.overallProgress?.total != null
              ? d.overallProgress.total
              : totalScenarios) || 0;
          acc.completed += comp;
          acc.total += tot;
          return acc;
        },
        { completed: 0, total: 0 },
      );
      const pct =
        totals.total > 0
          ? Math.round((totals.completed / totals.total) * 100)
          : 0;
      progressVis.innerHTML = `
        <div class="aggregate-progress">
          <div class="agg-bar"><div class="agg-fill" style="width:${pct}%"></div></div>
          <div class="agg-label">Class Average Progress: ${pct}%</div>
        </div>
      `;
    }
  }

  /**
   * Render Choices tab grid based on studentChoices
   * @param {Object} studentChoices
   */
  renderChoicesGrid(studentChoices = {}) {
    const modal = this.liveSessionModal?.element;
    if (!modal) return;
    const grid = modal.querySelector("#student-choices-grid");
    const scenarioFilter = modal.querySelector("#scenario-filter");
    const choiceFilter = modal.querySelector("#choice-filter");
    if (!grid) return;

    const selectedScenario = scenarioFilter?.value || "";
    const selectedStatus = choiceFilter?.value || ""; // completed|pending|""

    const rows = [];
    Object.entries(studentChoices || {}).forEach(([studentId, data]) => {
      const nickname = this.lookupNickname(studentId);
      const scenarios = data?.scenarios || {};
      // If filtering by scenario, reduce to that one
      const scenarioEntries = selectedScenario
        ? Object.entries(scenarios).filter(([sid]) => sid === selectedScenario)
        : Object.entries(scenarios);

      // Determine pending if needed using selectedScenarios list
      // Build a set of all scenarioIds to show pending rows when filter demands
      const allScenarioIds = (
        this.currentClassroom?.selectedScenarios || []
      ).map((s) => s.scenarioId);

      const pushRow = (sid, c) => {
        const status = c?.isComplete ? "completed" : "pending";
        if (selectedStatus && status !== selectedStatus) return;
        rows.push({
          nickname,
          studentId,
          scenarioId: sid,
          choice: c?.choice || "—",
          status,
        });
      };

      if (selectedStatus !== "pending") {
        scenarioEntries.forEach(([sid, c]) => pushRow(sid, c));
      }

      if (!selectedStatus || selectedStatus === "pending") {
        // Add pending rows for scenarios without a record
        const pendingIds = allScenarioIds.filter((sid) => !(sid in scenarios));
        const pendingFiltered = selectedScenario
          ? pendingIds.filter((sid) => sid === selectedScenario)
          : pendingIds;
        pendingFiltered.forEach((sid) => pushRow(sid, { isComplete: false }));
      }
    });

    if (rows.length === 0) {
      grid.innerHTML = `
        <div class="choices-placeholder"><p>No matching records yet.</p></div>
      `;
      return;
    }

    // Render a compact table
    const header = `
      <div class="choices-row head">
        <div class="col student">Student</div>
        <div class="col scenario">Scenario</div>
        <div class="col choice">Choice</div>
        <div class="col status">Status</div>
      </div>
    `;

    const scenarioTitleById = new Map(
      (this.currentClassroom?.selectedScenarios || []).map((s) => [
        s.scenarioId,
        s.title,
      ]),
    );

    const body = rows
      .map(
        (r) => `
        <div class="choices-row ${r.status}">
          <div class="col student">${r.nickname}</div>
          <div class="col scenario">${scenarioTitleById.get(r.scenarioId) || r.scenarioId}</div>
          <div class="col choice">${r.choice}</div>
          <div class="col status">${r.status}</div>
        </div>
      `,
      )
      .join("");

    grid.innerHTML = `<div class="choices-table">${header}${body}</div>`;

    // Attach filter change listeners once
    const ensureOnce = (el, type, handlerKey, handler) => {
      const key = `__${handlerKey}`;
      if (el && !el[key]) {
        el.addEventListener(type, handler);
        el[key] = true;
      }
    };

    ensureOnce(scenarioFilter, "change", "scenario_filter", () =>
      this.renderChoicesGrid(studentChoices),
    );
    ensureOnce(choiceFilter, "change", "choice_filter", () =>
      this.renderChoicesGrid(studentChoices),
    );
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
   * Show warning toast message
   */
  showWarningToast(message) {
    // This would integrate with the existing toast system
    console.log("⚠️ Warning:", message);
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
          "TeacherClassroomModals",
          `Failed to cleanup ${listener.name} listener`,
          error,
        );
      }
    });
    this.activeListeners = [];

    // Close modals
    this.createClassroomModal?.close();
    this.classroomCodeModal?.close();
    this.liveSessionModal?.close();

    logger.info("TeacherClassroomModals", "Cleanup completed");
  }

  // Event handlers for close operations
  handleCreateClassroomClose() {
    this.selectedScenarios = [];
  }

  handleClassroomCodeClose() {
    // Keep listeners for potential reopening
  }

  handleLiveSessionClose() {
    // Confirm before closing live session
    if (
      confirm(
        "Are you sure you want to close the live session? This will end the session for all students.",
      )
    ) {
      this.classroomService.completeSession(
        this.currentClassroom?.classroomCode,
      );
    }
  }
}
