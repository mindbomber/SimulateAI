ScenarioCoordinator (lightweight)

Purpose

- Central place to choose how a scenario behaves across contexts (modes)
- Gates reflection, badges, persistence, and analytics without touching ScenarioModal internals

Files

- constants/scenario-modes.js: enum + configs
- core/scenario-coordinator.js: listens to scenario-completed and scenario-modal-closed events

Usage

- Instantiate once per entry point and call bind()
- Set mode to one of SCENARIO_MODES; defaults to research_full

Current wiring

- utils/scenario-browser-integration.js creates and binds a coordinator for direct modal opens
- Default mode can be changed via configure({ defaultScenarioMode })

Next steps (optional)

- Wire app.js main launcher to use the coordinator (preserve defaults)
- Pass classroom-specific modes from classroom-integration-manager when launching
