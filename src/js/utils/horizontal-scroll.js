/**
 * Horizontal Scroll Enhancement - DISABLED
 * Disabled due to interference with normal page scrolling
 * Only basic scroll buttons remain for manual navigation
 */

// Constants for scroll buttons only
const DEFAULT_CARD_WIDTH = 350;

/**
 * Initialize horizontal scroll enhancements - DISABLED
 * No automatic scroll hijacking - just let native scrolling work
 */
export function initializeHorizontalScroll() {
  // No automatic scroll hijacking - just let native scrolling work
}

/**
 * Add scroll navigation buttons for manual navigation
 * @param {HTMLElement} grid - The grid element
 */
export function addScrollButtons(grid) {
  const container = grid.parentElement;
  if (!container || container.querySelector('.scroll-nav-btn')) return; // Prevent duplicates

  const prevButton = document.createElement('button');
  prevButton.className = 'scroll-nav-btn scroll-prev';
  prevButton.innerHTML = '←';
  prevButton.setAttribute('aria-label', 'Scroll to previous items');

  const nextButton = document.createElement('button');
  nextButton.className = 'scroll-nav-btn scroll-next';
  nextButton.innerHTML = '→';
  nextButton.setAttribute('aria-label', 'Scroll to next items');

  container.style.position = 'relative';

  const updateButtonVisibility = () => {
    const atStart = grid.scrollLeft <= 0;
    const atEnd = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 1;

    prevButton.style.display = atStart ? 'none' : 'block';
    nextButton.style.display = atEnd ? 'none' : 'block';
  };

  prevButton.addEventListener('click', () => {
    const cardWidth = grid.children[0]?.offsetWidth || DEFAULT_CARD_WIDTH;
    grid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    const cardWidth = grid.children[0]?.offsetWidth || DEFAULT_CARD_WIDTH;
    grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
  });

  grid.addEventListener('scroll', updateButtonVisibility);
  updateButtonVisibility();

  container.appendChild(prevButton);
  container.appendChild(nextButton);
}

/**
 * Re-initialize horizontal scroll - DISABLED
 */
export function reinitializeHorizontalScroll() {
  // No re-initialization needed - scroll enhancement is disabled
}

// Auto-initialization is disabled to prevent scroll interference
// Manual initialization can be called if needed for scroll buttons only
