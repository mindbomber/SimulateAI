import SCENARIO_MODES, { getModeConfig } from "../constants/scenario-modes.js";
import { ScenarioReflectionModal } from "../components/scenario-reflection-modal.js";
import badgeManager from "./badge-manager.js";

/**
 * ScenarioCoordinator
 * Orchestrates scenario flows according to selected mode.
 * Minimal integration: subscribes to scenario events and applies gating.
 */
export default class ScenarioCoordinator {
  constructor({ mode = SCENARIO_MODES.RESEARCH_FULL } = {}) {
    this.mode = mode;
    this.config = getModeConfig(mode);
    this._bound = false;
  }

  setMode(mode) {
    this.mode = mode;
    this.config = getModeConfig(mode);
  }

  bind() {
    if (this._bound) return;
    // Handle completion immediately (progress, analytics), reflection optional
    document.addEventListener("scenario-completed", this._onScenarioCompleted);
    // After modal fully closed, we may show badges depending on mode
    document.addEventListener("scenario-modal-closed", this._onScenarioClosed);
    this._bound = true;
  }

  unbind() {
    if (!this._bound) return;
    document.removeEventListener(
      "scenario-completed",
      this._onScenarioCompleted,
    );
    document.removeEventListener(
      "scenario-modal-closed",
      this._onScenarioClosed,
    );
    this._bound = false;
  }

  // Arrow functions to preserve this
  _onScenarioCompleted = async (event) => {
    const detail = event?.detail || {};
    const { categoryId, scenarioId } = detail;
    const cfg = this.config;

    // Persist progress only if enabled
    if (!cfg.persistProgress) {
      // No-op: ScenarioModal already wrote via DataHandler; in preview we opt out of badge updates
    }

    // Reflection gating
    if (cfg.showReflection) {
      new ScenarioReflectionModal({
        ...detail,
        isTestMode: this.mode === SCENARIO_MODES.PREVIEW,
        collectResearchData: cfg.analyticsLevel === "full",
        enableAnalytics: cfg.analyticsLevel !== "none",
      });
    }

    // Notify MainGrid of progress for modes that persist progress
    if (cfg.persistProgress) {
      const progressUpdateEvent = new CustomEvent("scenario-progress-update", {
        detail: {
          scenarioId,
          categoryId,
          selectedOption: detail.selectedOption || detail.option || null,
          option: detail.selectedOption || detail.option || null,
          completionTime: detail.completionTime || null,
          timestamp: new Date().toISOString(),
        },
      });
      document.dispatchEvent(progressUpdateEvent);
    }

    // Badge progress is handled after close to avoid overlap with reflection UI
    this._pendingBadgeUpdate = cfg.enableBadges
      ? { categoryId, scenarioId }
      : null;
  };

  _onScenarioClosed = async (event) => {
    const detail = event?.detail || {};
    // Only process if the scenario was completed and badge updates are enabled
    if (!detail?.completed || !this._pendingBadgeUpdate) return;

    const { categoryId, scenarioId } = this._pendingBadgeUpdate;
    this._pendingBadgeUpdate = null;

    try {
      await badgeManager.updateScenarioCompletion(categoryId, scenarioId);
      // Badge modal display remains under existing app flow; coordinator only updates progress
    } catch (e) {
      // Soft-fail; do not block UI
      console.warn("[ScenarioCoordinator] Badge update failed", e);
    }
  };
}

export { SCENARIO_MODES };
