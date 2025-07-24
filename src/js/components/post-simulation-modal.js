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
 * ⚠️ DEPRECATED - PostSimulationModal - Phase 3 Implementation ⚠️
 *
 * This component has been DISABLED and replaced by ScenarioReflectionModal.
 *
 * REASON FOR DEPRECATION:
 * - Originally designed for complex multi-decision simulations
 * - Incompatible with ScenarioModal's single-choice architecture
 * - Replaced by scenario-reflection-modal.js which provides:
 *   * Community choice comparison
 *   * Single-choice focused reflection
 *   * Research data collection
 *   * Better alignment with ScenarioModal system
 *
 * STATUS: Preserved for potential future use with different simulation types
 * DATE DEPRECATED: January 2025
 * REPLACEMENT: ScenarioReflectionModal (scenario-reflection-modal.js)
 *
 * A comprehensive post-simulation reflection modal that provides structured
 * reflection, learning reinforcement, and progress tracking after simulation completion.
 *
 * Features:
 * - Guided reflection questionnaire system
 * - Progress visualization and decision journey
 * - Learning reinforcement and concept connections
 * - Personalized recommendations and next steps
 * - Export and sharing capabilities
 *
 * @author SimulateAI Development Team
 * @version 3.0.0 (DEPRECATED)
 */

// ⚠️ DEPRECATED IMPORTS - Preserved for reference only
// import ModalUtility from "./modal-utility.js";
// import { simulationInfo } from "../data/simulation-info.js";
// import { userProgress } from "../utils/simple-storage.js";
// import { simpleAnalytics } from "../utils/simple-analytics.js";
// import Helpers from "../utils/helpers.js";
// import { PERFORMANCE } from "../utils/constants.js";

// These imports are commented out since the component is deprecated
// Uncomment if the component is restored in the future

// ⚠️ DEPRECATED CONSTANTS - Preserved for reference only
// const REFLECTION_STEPS = {
//   SUMMARY: 0,
//   FEELINGS: 1,
//   INSIGHTS: 2,
//   LEARNING: 3,
//   NEXT_STEPS: 4,
// };

export class PostSimulationModal {
  constructor(options = {}) {
    // ⚠️ DEPRECATED: This component has been disabled
    console.warn(
      "⚠️ PostSimulationModal is DEPRECATED. Use ScenarioReflectionModal instead.",
    );
    console.warn("📍 Replacement: scenario-reflection-modal.js");
    console.warn(
      "💡 Reason: Better alignment with ScenarioModal single-choice architecture",
    );

    // Immediately call onComplete to prevent blocking the application
    const onComplete = options.onComplete || (() => {});
    setTimeout(() => {
      onComplete();
    }, 100);

    // Store original options for potential future restoration
    this._deprecatedOptions = options;
    this._deprecationDate = new Date().toISOString();
    this._replacementComponent = "ScenarioReflectionModal";

    // Set all properties to null/disabled state
    this.options = null;
    this.simulationInfo = null;
    this.sessionData = null;
    this.reflectionData = null;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.modal = null;

    // Log deprecation info for debugging
    this._logDeprecationInfo();
  }

  /**
   * Log deprecation information for developers
   */
  _logDeprecationInfo() {
    console.group("🚨 PostSimulationModal Deprecation Info");
    console.log("Status: DISABLED");
    console.log("Deprecated on:", this._deprecationDate);
    console.log("Replacement:", this._replacementComponent);
    console.log(
      "Migration path: Use ScenarioReflectionModal for scenario-based reflections",
    );
    console.log(
      "Preserved for: Potential future multi-decision simulation systems",
    );
    console.groupEnd();
  }

  /**
   * All methods are disabled and return immediately
   */
  init() {
    console.warn("PostSimulationModal.init() called on deprecated component");
    return;
  }

  show() {
    console.warn("PostSimulationModal.show() called on deprecated component");
    return;
  }

  /**
   * Static method to check if component is deprecated
   */
  static isDeprecated() {
    return true;
  }

  /**
   * Static method to get replacement component info
   */
  static getReplacementInfo() {
    return {
      component: "ScenarioReflectionModal",
      file: "scenario-reflection-modal.js",
      reason: "Better alignment with ScenarioModal single-choice architecture",
      features: [
        "Community choice comparison",
        "Single-choice focused reflection",
        "Research data collection",
        "Global statistics display",
      ],
    };
  }
}

/* 
================================================================================
ORIGINAL IMPLEMENTATION PRESERVED BELOW FOR FUTURE REFERENCE
================================================================================

The complete original implementation has been commented out to preserve it
for potential future use. If you need to restore this component for a different
type of simulation system (multi-decision, complex scenarios), you can:

1. Uncomment the imports at the top
2. Uncomment the REFLECTION_STEPS constant
3. Uncomment the implementation below
4. Update the constructor to restore original functionality

Original features included:
- 5-step reflection process
- Multiple decision tracking
- Session duration analysis
- Complex ethical scoring
- Learning reinforcement
- Progress visualization

Note: This implementation was specifically designed for multi-decision simulation
systems and may not be suitable for single-choice scenario systems without
significant modifications.
*/

/*
// ORIGINAL IMPLEMENTATION STARTS HERE (COMMENTED OUT)

  // Original constructor would go here...
  // Original methods would go here...
  
// ORIGINAL IMPLEMENTATION ENDS HERE (COMMENTED OUT)
*/
