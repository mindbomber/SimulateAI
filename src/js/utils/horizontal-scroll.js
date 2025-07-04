/**
 * Horizontal Scroll Enhancement
 * Adds smooth scrolling and navigation features to scenarios grids
 */

// Constants
const SCROLL_END_DELAY = 150;
const DEFAULT_CARD_WIDTH = 350;
const LEFT_EDGE_THRESHOLD = 50; // Distance from left edge to consider as "at start"
const SCROLL_SNAP_INIT_DELAY = 200; // Delay before re-enabling scroll snap
const PAGE_SCROLL_SNAP_DELAY = 300; // Delay before ensuring page scroll snap is disabled
const MOBILE_BREAKPOINT = 768; // Mobile breakpoint for device detection

/**
 * Initialize horizontal scroll enhancements for all scenarios grids
 */
export function initializeHorizontalScroll() {
  // Temporarily disable scroll snap on page to prevent interference
  document.documentElement.style.scrollSnapType = 'none';
  document.body.style.scrollSnapType = 'none';
  
  const scenariosGrids = document.querySelectorAll('.scenarios-grid');
  
  scenariosGrids.forEach(grid => {
    // Temporarily disable scroll snap during initialization
    const originalScrollSnapType = grid.style.scrollSnapType;
    grid.style.scrollSnapType = 'none';
    
    // Ensure scroll starts at the leftmost position
    resetScrollPosition(grid);
    enhanceScrolling(grid);
    addKeyboardNavigation(grid);
    
    // Only add touch enhancements on desktop to avoid interfering with native mobile scroll
    if (!isMobileDevice()) {
      addTouchEnhancements(grid);
    }
    
    // Re-enable scroll snap after initialization
    setTimeout(() => {
      grid.style.scrollSnapType = originalScrollSnapType || 'x mandatory';
    }, SCROLL_SNAP_INIT_DELAY);
    
    // Prevent initial snap behavior on page load
    grid.setAttribute('data-initialized', 'true');
  });
  
  // Re-enable page scroll snap after initialization (should remain none)
  setTimeout(() => {
    document.documentElement.style.scrollSnapType = 'none';
    document.body.style.scrollSnapType = 'none';
  }, PAGE_SCROLL_SNAP_DELAY);
}

/**
 * Reset scroll position to show the first card
 * @param {HTMLElement} grid - The scenarios grid element
 */
function resetScrollPosition(grid) {
  // Set scroll position to 0 (leftmost)
  grid.scrollLeft = 0;
  
  // Ensure the first card is properly visible after any layout changes
  requestAnimationFrame(() => {
    grid.scrollLeft = 0;
    
    // Additional reset after a short delay to handle dynamic content
    setTimeout(() => {
      grid.scrollLeft = 0;
    }, 100);
  });
}

/**
 * Enhance scrolling behavior for a scenarios grid
 * @param {HTMLElement} grid - The scenarios grid element
 */
function enhanceScrolling(grid) {
  let isScrolling = false;
  let scrollTimeout;
  let isInitialLoad = true;

  // Add scroll event listener for smooth snap behavior
  grid.addEventListener('scroll', () => {
    if (!isScrolling) {
      isScrolling = true;
    }

    // Clear the timeout
    clearTimeout(scrollTimeout);

    // Set a timeout to detect scroll end
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      
      // Skip snapping if this is the initial load and we're at the start
      if (isInitialLoad && grid.scrollLeft === 0) {
        isInitialLoad = false;
        return;
      }
      
      isInitialLoad = false;
      snapToNearestCard(grid);
    }, SCROLL_END_DELAY);
  });

  // Add wheel event for horizontal scrolling with mouse wheel
  grid.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return; // Already scrolling horizontally
    }
    
    e.preventDefault();
    grid.scrollLeft += e.deltaY;
    isInitialLoad = false; // User interaction, no longer initial load
  }, { passive: false });
}

/**
 * Snap to the nearest card after scrolling ends
 * @param {HTMLElement} grid - The scenarios grid element
 */
function snapToNearestCard(grid) {
  const cards = Array.from(grid.children);
  if (cards.length === 0) return;

  // If we're very close to the left edge, stay at the first card
  if (grid.scrollLeft <= LEFT_EDGE_THRESHOLD) {
    cards[0].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
    return;
  }

  const gridRect = grid.getBoundingClientRect();
  const gridLeft = gridRect.left;

  let closestCard = cards[0];
  let closestDistance = Infinity;

  cards.forEach(card => {
    const cardRect = card.getBoundingClientRect();
    const cardLeft = cardRect.left;
    const distance = Math.abs(cardLeft - gridLeft);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestCard = card;
    }
  });

  // Smooth scroll to the closest card
  closestCard.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'start'
  });
}

/**
 * Add keyboard navigation support
 * @param {HTMLElement} grid - The scenarios grid element
 */
function addKeyboardNavigation(grid) {
  grid.addEventListener('keydown', (e) => {
    const cards = Array.from(grid.children);
    const focusedCard = document.activeElement;
    const currentIndex = cards.indexOf(focusedCard);

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentIndex > 0) {
          cards[currentIndex - 1].focus();
          cards[currentIndex - 1].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
          });
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (currentIndex < cards.length - 1) {
          cards[currentIndex + 1].focus();
          cards[currentIndex + 1].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
          });
        }
        break;

      case 'Home':
        e.preventDefault();
        cards[0].focus();
        cards[0].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
        break;

      case 'End':
        e.preventDefault();
        cards[cards.length - 1].focus();
        cards[cards.length - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
        break;
    }
  });
}

/**
 * Add touch enhancements for mobile devices
 * @param {HTMLElement} grid - The scenarios grid element
 */
function addTouchEnhancements(grid) {
  let startX = 0;
  let scrollLeft = 0;
  let isDown = false;

  grid.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - grid.offsetLeft;
    const { scrollLeft: currentScrollLeft } = grid;
    scrollLeft = currentScrollLeft;
  });

  grid.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - grid.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    grid.scrollLeft = scrollLeft - walk;
  });

  grid.addEventListener('touchend', () => {
    isDown = false;
    setTimeout(() => snapToNearestCard(grid), 100);
  });
}

/**
 * Add scroll navigation buttons (optional enhancement)
 * @param {HTMLElement} grid - The scenarios grid element
 */
export function addScrollButtons(grid) {
  const container = grid.parentElement;
  
  // Create navigation buttons
  const prevButton = document.createElement('button');
  prevButton.className = 'scroll-nav-btn scroll-prev';
  prevButton.innerHTML = '←';
  prevButton.setAttribute('aria-label', 'Scroll to previous scenarios');
  
  const nextButton = document.createElement('button');
  nextButton.className = 'scroll-nav-btn scroll-next';
  nextButton.innerHTML = '→';
  nextButton.setAttribute('aria-label', 'Scroll to next scenarios');
  
  // Position buttons
  container.style.position = 'relative';
  
  // Add button event listeners
  prevButton.addEventListener('click', () => {
    const cardWidth = grid.children[0]?.offsetWidth || DEFAULT_CARD_WIDTH;
    grid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  });
  
  nextButton.addEventListener('click', () => {
    const cardWidth = grid.children[0]?.offsetWidth || DEFAULT_CARD_WIDTH;
    grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
  });
  
  // Update button visibility based on scroll position
  function updateButtonVisibility() {
    prevButton.style.display = grid.scrollLeft > 0 ? 'block' : 'none';
    nextButton.style.display = 
      grid.scrollLeft < grid.scrollWidth - grid.clientWidth ? 'block' : 'none';
  }
  
  grid.addEventListener('scroll', updateButtonVisibility);
  updateButtonVisibility();
  
  container.appendChild(prevButton);
  container.appendChild(nextButton);
}

/**
 * Add defensive measures to prevent scroll snap from affecting page scrolling
 */
export function preventPageScrollSnap() {
  // Ensure page-level scroll snap is always disabled
  const ensurePageScrollSnapDisabled = () => {
    document.documentElement.style.scrollSnapType = 'none';
    document.body.style.scrollSnapType = 'none';
  };
  
  // Run immediately
  ensurePageScrollSnapDisabled();
  
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensurePageScrollSnapDisabled);
  }
  
  // Run after window load
  window.addEventListener('load', ensurePageScrollSnapDisabled);
  
  // Run periodically to ensure it stays disabled
  setInterval(ensurePageScrollSnapDisabled, 1000);
}

/**
 * Check if the current device is mobile
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= MOBILE_BREAKPOINT 
    || ('ontouchstart' in window);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeHorizontalScroll();
});

// Re-initialize when new content is added dynamically
export function reinitializeHorizontalScroll() {
  initializeHorizontalScroll();
}
