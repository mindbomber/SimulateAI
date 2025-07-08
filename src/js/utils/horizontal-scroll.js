/**
 * Horizontal Scroll Enhancement
 * Simplified, maintainable approach for category grid scrolling
 */

import focusManager from './focus-manager.js';

// Simplified constants
const SCROLL_END_DELAY = 150;
const DEFAULT_CARD_WIDTH = 350;
const MOBILE_BREAKPOINT = 768;
const LEFT_EDGE_THRESHOLD = 50;

// Modern scroll physics constants - tuned for natural feel
const MOMENTUM_THRESHOLD = 0.05;
const FRICTION_COEFFICIENT = 0.88; // Lower for quicker deceleration
const ACCELERATION_FACTOR = 1.2; // Higher for more responsive initial movement
const MAX_ACCELERATION = 25; // Reduced max for smoother experience
const MAX_MOMENTUM = 60; // Balanced momentum cap
const TOUCH_MULTIPLIER = 2.5;
const SCROLL_SENSITIVITY = 0.8; // Fine-tune overall sensitivity

// Enhanced physics constants
const MIN_FRAME_TIME = 16; // Minimum frame time for smooth animation
const TIME_ACCELERATION_FACTOR = 0.5; // Time-based acceleration multiplier
const MAX_TIME_MULTIPLIER = 2; // Maximum time-based acceleration
const ACCELERATION_CURVE = 0.9; // Acceleration curve power
const DIRECTION_CHANGE_DAMPING = 0.6; // Momentum reduction for direction changes
const TOUCH_VELOCITY_THRESHOLD = 0.1; // Minimum velocity for touch momentum
const TOUCH_MOMENTUM_MULTIPLIER = 200; // Touch velocity to momentum conversion

/**
 * HorizontalScrollManager - Simplified class-based approach
 */
class HorizontalScrollManager {
  constructor(grid) {
    this.grid = grid;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.init();
  }

  init() {
    this.resetScrollPosition();
    this.setupScrollSnapping();
    this.setupWheelScrolling();
    this.setupKeyboardNavigation();
    
    if (!this.isMobile()) {
      this.setupTouchEnhancements();
    }
  }

  resetScrollPosition() {
    this.grid.scrollLeft = 0;
  }

  setupScrollSnapping() {
    this.grid.addEventListener('scroll', () => {
      this.isScrolling = true;
      clearTimeout(this.scrollTimeout);
      
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.snapToNearestCard();
      }, SCROLL_END_DELAY);
    });
  }

  setupWheelScrolling() {
    let momentum = 0;
    let isAnimating = false;
    let animationId = null;
    let lastWheelTime = 0;

    const applyMomentum = () => {
      if (Math.abs(momentum) < MOMENTUM_THRESHOLD) {
        momentum = 0;
        isAnimating = false;
        return;
      }

      const currentScroll = this.grid.scrollLeft;
      const maxScrollLeft = this.grid.scrollWidth - this.grid.clientWidth;
      const newScrollLeft = Math.max(0, Math.min(currentScroll + momentum, maxScrollLeft));
      
      this.grid.scrollLeft = newScrollLeft;
      momentum *= FRICTION_COEFFICIENT; // Apply friction for natural deceleration
      
      if (isAnimating) {
        animationId = requestAnimationFrame(applyMomentum);
      }
    };

    this.grid.addEventListener('wheel', (e) => {
      // Only intercept vertical scrolling when hovering over the grid
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (!e.target.closest('.scenarios-grid, .categories-grid, .simulations-grid')) return;
      
      e.preventDefault();
      
      const now = Date.now();
      const timeDelta = now - lastWheelTime;
      lastWheelTime = now;
      
      // Enhanced physics for modern feel
      const rawDelta = e.deltaY * SCROLL_SENSITIVITY;
      
      // Apply acceleration curve for natural feel
      const accelerationMultiplier = Math.min(
        1 + (1 / Math.max(timeDelta, MIN_FRAME_TIME)) * TIME_ACCELERATION_FACTOR, 
        MAX_TIME_MULTIPLIER
      );
      const delta = rawDelta * accelerationMultiplier;
      
      // Convert to momentum with smooth acceleration
      const acceleration = Math.sign(delta) * Math.min(
        Math.pow(Math.abs(delta) * ACCELERATION_FACTOR, ACCELERATION_CURVE), 
        MAX_ACCELERATION
      );
      
      // Add to momentum with smooth blending
      if (Math.sign(momentum) !== Math.sign(acceleration) && Math.abs(momentum) > 1) {
        // Opposite direction - reduce momentum faster for responsive direction changes
        momentum *= DIRECTION_CHANGE_DAMPING;
      }
      
      momentum += acceleration;
      momentum = Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, momentum));
      
      // Start momentum animation if not already running
      if (!isAnimating) {
        isAnimating = true;
        animationId = requestAnimationFrame(applyMomentum);
      }
    }, { passive: false });

    // Clean up animation on component destruction
    this.cleanup = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }

  setupKeyboardNavigation() {
    const keyboardHandler = focusManager.createKeyboardNavigator(this.grid, {
      orientation: 'horizontal',
      wrap: false
    });
    this.grid.addEventListener('keydown', keyboardHandler);
  }

  setupTouchEnhancements() {
    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;
    let lastMoveTime = 0;
    let velocity = 0;

    this.grid.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX;
      ({ scrollLeft } = this.grid);
      lastMoveTime = Date.now();
      velocity = 0;
    });

    this.grid.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      
      const x = e.touches[0].pageX;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastMoveTime;
      
      // Enhanced touch physics with momentum tracking
      const walk = (startX - x) * TOUCH_MULTIPLIER;
      this.grid.scrollLeft = scrollLeft + walk;
      
      // Track velocity for momentum
      if (timeDelta > 0) {
        velocity = walk / timeDelta;
      }
      lastMoveTime = currentTime;
    });

    this.grid.addEventListener('touchend', () => {
      isDown = false;
      
      // Apply momentum for natural touch feel
      if (Math.abs(velocity) > TOUCH_VELOCITY_THRESHOLD) {
        let momentum = velocity * TOUCH_MOMENTUM_MULTIPLIER; // Convert to scroll momentum
        momentum = Math.max(-MAX_MOMENTUM, Math.min(MAX_MOMENTUM, momentum));
        
        const applyTouchMomentum = () => {
          if (Math.abs(momentum) < MOMENTUM_THRESHOLD) {
            setTimeout(() => this.snapToNearestCard(), 100);
            return;
          }

          const currentScroll = this.grid.scrollLeft;
          const maxScrollLeft = this.grid.scrollWidth - this.grid.clientWidth;
          const newScrollLeft = Math.max(0, Math.min(currentScroll + momentum, maxScrollLeft));
          
          this.grid.scrollLeft = newScrollLeft;
          momentum *= FRICTION_COEFFICIENT;
          
          requestAnimationFrame(applyTouchMomentum);
        };
        
        requestAnimationFrame(applyTouchMomentum);
      } else {
        setTimeout(() => this.snapToNearestCard(), 100);
      }
    });
  }

  snapToNearestCard() {
    const cards = Array.from(this.grid.children);
    if (cards.length === 0) return;

    // Stay at first card if close to left edge
    if (this.grid.scrollLeft <= LEFT_EDGE_THRESHOLD) {
      cards[0].scrollIntoView({ behavior: 'smooth', inline: 'start' });
      return;
    }

    // Find closest card to viewport center
    const gridRect = this.grid.getBoundingClientRect();
    const gridCenter = gridRect.left + gridRect.width / 2;

    let closestCard = cards[0];
    let closestDistance = Infinity;

    cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - gridCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestCard = card;
      }
    });

    closestCard.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }

  isMobile() {
    return 'ontouchstart' in window || window.innerWidth <= MOBILE_BREAKPOINT;
  }
}

/**
 * Initialize horizontal scroll enhancements for all grids
 */
export function initializeHorizontalScroll() {
  // Disable page-level scroll snap
  document.documentElement.style.scrollSnapType = 'none';
  document.body.style.scrollSnapType = 'none';
  
  const grids = document.querySelectorAll('.categories-grid, .simulations-grid, .scenarios-grid');
  
  grids.forEach(grid => {
    if (!grid.hasAttribute('data-scroll-enhanced')) {
      new HorizontalScrollManager(grid);
      grid.setAttribute('data-scroll-enhanced', 'true');
    }
  });
}

/**
 * Add scroll navigation buttons (simplified)
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

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHorizontalScroll);
} else {
  initializeHorizontalScroll();
}

// Re-initialize when new content is added dynamically
export function reinitializeHorizontalScroll() {
  initializeHorizontalScroll();
}
