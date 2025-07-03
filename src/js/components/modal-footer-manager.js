/**
 * Modal Footer Utilities
 * Handles overflow detection, responsive behavior, and accessibility for modal footers
 */

class ModalFooterManager {
  constructor() {
    this.observedFooters = new Set();
    this.resizeObserver = null;
    this.init();
  }

  init() {
    // Set up resize observer for responsive behavior
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          this.handleFooterResize(entry.target);
        });
      });
    }

    // Auto-detect and manage existing modal footers
    this.scanForModalFooters();

    // Set up mutation observer for dynamically added modals
    this.setupMutationObserver();
  }

  scanForModalFooters() {
    const footers = document.querySelectorAll('.modal-footer');
    footers.forEach(footer => this.manageFooter(footer));
  }

  manageFooter(footer) {
    if (this.observedFooters.has(footer)) return;

    this.observedFooters.add(footer);

    // Add overflow detection
    this.setupOverflowDetection(footer);

    // Add responsive behavior
    this.setupResponsiveBehavior(footer);

    // Add accessibility improvements
    this.setupAccessibility(footer);

    // Start observing size changes
    if (this.resizeObserver) {
      this.resizeObserver.observe(footer);
    }
  }

  setupOverflowDetection(footer) {
    const checkOverflow = () => {
      const hasHorizontalOverflow = footer.scrollWidth > footer.clientWidth;
      const hasVerticalOverflow = footer.scrollHeight > footer.clientHeight;

      footer.classList.toggle('has-overflow-x', hasHorizontalOverflow);
      footer.classList.toggle('has-overflow-y', hasVerticalOverflow);
      footer.classList.toggle(
        'has-overflow',
        hasHorizontalOverflow || hasVerticalOverflow
      );

      // Add scroll indicators
      if (hasHorizontalOverflow) {
        this.addScrollIndicators(footer);
      } else {
        this.removeScrollIndicators(footer);
      }
    };

    // Initial check
    checkOverflow();

    // Check on scroll
    footer.addEventListener('scroll', checkOverflow);

    // Store reference for cleanup
    footer._checkOverflow = checkOverflow;
  }

  setupResponsiveBehavior(footer) {
    const buttons = footer.querySelectorAll('.modal-button');

    // Add many-buttons class if there are many buttons
    if (buttons.length > 4) {
      footer.classList.add('many-buttons');
    }

    // Handle responsive button layout
    const handleResponsiveLayout = () => {
      const footerWidth = footer.clientWidth;
      const isMobile = window.innerWidth <= 768;
      const isSmallMobile = window.innerWidth <= 480;

      footer.classList.toggle('mobile-layout', isMobile);
      footer.classList.toggle('small-mobile-layout', isSmallMobile);

      // Calculate if buttons need stacking
      if (!isMobile) {
        let totalButtonWidth = 0;
        buttons.forEach(button => {
          totalButtonWidth += button.offsetWidth;
        });

        const gapWidth = (buttons.length - 1) * 12; // Default gap
        const padding = 40; // Total horizontal padding
        const needsStacking =
          totalButtonWidth + gapWidth + padding > footerWidth;

        footer.classList.toggle('needs-stacking', needsStacking);
      }
    };

    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);

    // Store reference for cleanup
    footer._handleResponsiveLayout = handleResponsiveLayout;
  }

  setupAccessibility(footer) {
    // Add ARIA attributes
    footer.setAttribute('role', 'group');
    footer.setAttribute('aria-label', 'Modal actions');

    // Improve focus management
    const buttons = footer.querySelectorAll('.modal-button');
    buttons.forEach((button, index) => {
      // Add keyboard navigation
      button.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && index > 0) {
          buttons[index - 1].focus();
          e.preventDefault();
        } else if (e.key === 'ArrowRight' && index < buttons.length - 1) {
          buttons[index + 1].focus();
          e.preventDefault();
        }
      });
    });

    // Ensure last button (usually primary) gets focus by default
    const primaryButton =
      footer.querySelector('.modal-button.primary') ||
      footer.querySelector('.modal-button:last-child');
    if (primaryButton) {
      primaryButton.setAttribute('data-default-focus', 'true');
    }
  }

  addScrollIndicators(footer) {
    if (footer.querySelector('.scroll-indicator')) return;

    // Left indicator
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'scroll-indicator scroll-indicator-left';
    leftIndicator.innerHTML = '‹';

    // Right indicator
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'scroll-indicator scroll-indicator-right';
    rightIndicator.innerHTML = '›';

    footer.appendChild(leftIndicator);
    footer.appendChild(rightIndicator);

    this.updateScrollIndicators(footer);

    // Update indicators on scroll
    footer.addEventListener('scroll', () =>
      this.updateScrollIndicators(footer)
    );
  }

  updateScrollIndicators(footer) {
    const leftIndicator = footer.querySelector('.scroll-indicator-left');
    const rightIndicator = footer.querySelector('.scroll-indicator-right');

    if (!leftIndicator || !rightIndicator) return;

    const isAtStart = footer.scrollLeft <= 0;
    const isAtEnd =
      footer.scrollLeft >= footer.scrollWidth - footer.clientWidth;

    leftIndicator.style.opacity = isAtStart ? '0' : '1';
    rightIndicator.style.opacity = isAtEnd ? '0' : '1';
  }

  removeScrollIndicators(footer) {
    const indicators = footer.querySelectorAll('.scroll-indicator');
    indicators.forEach(indicator => indicator.remove());
  }

  handleFooterResize(footer) {
    if (footer._checkOverflow) {
      footer._checkOverflow();
    }
    if (footer._handleResponsiveLayout) {
      footer._handleResponsiveLayout();
    }
  }

  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a modal footer
            if (node.classList && node.classList.contains('modal-footer')) {
              this.manageFooter(node);
            }
            // Check for modal footers within the added node
            const footers =
              node.querySelectorAll && node.querySelectorAll('.modal-footer');
            if (footers) {
              footers.forEach(footer => this.manageFooter(footer));
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  cleanup(footer) {
    this.observedFooters.delete(footer);
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(footer);
    }
    this.removeScrollIndicators(footer);

    // Remove event listeners
    if (footer._checkOverflow) {
      footer.removeEventListener('scroll', footer._checkOverflow);
    }
    if (footer._handleResponsiveLayout) {
      window.removeEventListener('resize', footer._handleResponsiveLayout);
    }
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.observedFooters.forEach(footer => this.cleanup(footer));
    this.observedFooters.clear();
  }
}

// Export for ES6 modules (default export)
export default ModalFooterManager;

// Export for CommonJS (backward compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalFooterManager;
}
