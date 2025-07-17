/**
 * Category Header Component Usage Example
 *
 * This file demonstrates how to use the CategoryHeader component
 * independently from the CategoryGrid.
 */

import CategoryHeader from './category-header.js';
import { getCategoryProgress } from '../../data/categories.js';

// Example usage
const categoryHeader = new CategoryHeader();

// Example category data
const exampleCategory = {
  id: 'ai-bias',
  title: 'AI Bias & Fairness',
  description: 'Explore algorithmic bias and fairness in AI systems',
  icon: '⚖️',
  color: '#8B5CF6',
  difficulty: 'intermediate',
  estimatedTime: 25,
};

// Get progress for this category
const progress = getCategoryProgress(exampleCategory.id, {});

// Render the header HTML
const headerHtml = categoryHeader.render(exampleCategory, progress);

// Add to DOM
const container = document.getElementById('category-container');
if (container) {
  container.innerHTML = headerHtml;

  // Attach event listeners for tooltips
  categoryHeader.attachEventListeners(container);
}

// Cleanup when done
// categoryHeader.cleanup();

export { categoryHeader };
