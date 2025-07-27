// SCENARIO VIEW PROGRESS RING FIX
// This file contains the implementation to add visible progress rings to scenario view

/**
 * Enhanced MainGrid renderScenarioView to include visible category progress indicators
 * This addresses the issue where progress rings were only visible on hover
 */

// SOLUTION 1: Add category progress summary at the top of scenario view
const addCategoryProgressSummary = (
  scenarioContainer,
  categories,
  userProgress,
  getCategoryProgress,
) => {
  // Create category progress summary section
  const progressSummary = document.createElement("div");
  progressSummary.className = "scenario-view-progress-summary";
  progressSummary.innerHTML = `
    <h3 class="progress-summary-title">Category Progress</h3>
    <div class="progress-categories-grid"></div>
  `;

  const progressGrid = progressSummary.querySelector(
    ".progress-categories-grid",
  );

  // Add progress ring for each category
  categories.forEach((category) => {
    const progress = getCategoryProgress(category.id);

    const categoryProgressItem = document.createElement("div");
    categoryProgressItem.className = "category-progress-item";
    categoryProgressItem.innerHTML = `
      <div class="category-progress-ring-mini" 
           data-category-id="${category.id}"
           data-tooltip="${progress.completed}/${progress.total} scenarios completed"
           style="--category-color: ${category.color}">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(200,200,200,0.3)" stroke-width="3"/>
          <circle cx="20" cy="20" r="16" fill="none" 
                  stroke="${category.color}" 
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-dasharray="100"
                  stroke-dashoffset="${100 - progress.percentage}"
                  transform="rotate(-90 20 20)"/>
        </svg>
        <span class="progress-percentage-mini">${progress.percentage}%</span>
      </div>
      <div class="category-info-mini">
        <span class="category-icon-mini">${category.icon}</span>
        <span class="category-title-mini">${category.title}</span>
        <span class="category-progress-text-mini">${progress.completed}/${progress.total}</span>
      </div>
    `;

    progressGrid.appendChild(categoryProgressItem);
  });

  // Insert at the beginning of scenario container
  scenarioContainer.insertBefore(progressSummary, scenarioContainer.firstChild);
};

// SOLUTION 2: Add category grouping with progress rings in scenario view
const addCategoryGroupingWithProgress = (
  scenarioContainer,
  allScenarios,
  categoryHeader,
  getCategoryProgress,
) => {
  // Group scenarios by category
  const scenariosByCategory = {};
  allScenarios.forEach((scenario) => {
    if (!scenariosByCategory[scenario.categoryId]) {
      scenariosByCategory[scenario.categoryId] = [];
    }
    scenariosByCategory[scenario.categoryId].push(scenario);
  });

  // Create category sections with progress rings
  Object.entries(scenariosByCategory).forEach(([categoryId, scenarios]) => {
    const category = scenarios[0].category || {
      id: categoryId,
      title: "Unknown Category",
      color: "#667eea",
      icon: "🤖",
    };

    const progress = getCategoryProgress(categoryId);

    // Create category section header with progress ring
    const categorySection = document.createElement("div");
    categorySection.className = "scenario-category-section";
    categorySection.innerHTML = `
      <div class="scenario-category-header">
        <div class="category-info">
          <span class="category-icon">${category.icon}</span>
          <h3 class="category-title">${category.title}</h3>
          <span class="category-progress-text">${progress.completed}/${progress.total} completed</span>
        </div>
        <div class="category-progress-ring visible" 
             data-category-id="${categoryId}"
             data-tooltip="${progress.completed}/${progress.total} scenarios completed (${progress.percentage}%)">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(200,200,200,0.2)" stroke-width="4"/>
            <circle cx="30" cy="30" r="26" fill="none" 
                    stroke="${category.color}" 
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="163"
                    stroke-dashoffset="${163 - (progress.percentage / 100) * 163}"
                    transform="rotate(-90 30 30)"
                    class="progress-circle"/>
          </svg>
          <span class="progress-percentage">${progress.percentage}%</span>
        </div>
      </div>
      <div class="scenario-category-grid"></div>
    `;

    const categoryGrid = categorySection.querySelector(
      ".scenario-category-grid",
    );

    // Add scenarios to this category section
    scenarios.forEach((scenario) => {
      // Create scenario card (existing logic would go here)
      const scenarioCard = document.createElement("div");
      scenarioCard.className = "scenario-card-in-category";
      scenarioCard.innerHTML = `<!-- scenario card content -->`;
      categoryGrid.appendChild(scenarioCard);
    });

    scenarioContainer.appendChild(categorySection);
  });
};

// CSS for the new progress elements
const SCENARIO_VIEW_PROGRESS_CSS = `
/* Category Progress Summary */
.scenario-view-progress-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.progress-summary-title {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.progress-categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.category-progress-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  transition: all 0.2s ease;
}

.category-progress-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transform: translateY(-1px);
}

.category-progress-ring-mini {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress-percentage-mini {
  position: absolute;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.category-info-mini {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.category-icon-mini {
  font-size: 1.25rem;
}

.category-title-mini {
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-progress-text-mini {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Category Sections in Scenario View */
.scenario-category-section {
  margin-bottom: var(--spacing-8);
}

.scenario-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border-bottom: none;
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.category-icon {
  font-size: 1.5rem;
}

.category-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.category-progress-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.category-progress-ring.visible {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-progress-ring.visible:hover {
  transform: scale(1.05);
}

.scenario-category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

/* Progress ring animations */
.category-progress-ring.visible .progress-circle {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive design */
@media (max-width: 768px) {
  .progress-categories-grid {
    grid-template-columns: 1fr;
  }
  
  .scenario-category-header {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: flex-start;
  }
  
  .scenario-category-grid {
    grid-template-columns: 1fr;
  }
}
`;

export {
  addCategoryProgressSummary,
  addCategoryGroupingWithProgress,
  SCENARIO_VIEW_PROGRESS_CSS,
};
