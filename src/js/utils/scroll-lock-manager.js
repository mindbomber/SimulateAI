/**
 * Scroll Lock Manager - Centralized scroll management system
 * Prevents conflicts between multiple modal systems and ensures proper scroll restoration
 * 
 * This fixes the issue where scenario completion would leave the app in a scroll-locked state
 */

import { logger } from "./logger.js";

class ScrollLockManager {
  constructor() {
    this.lockCount = 0;
    this.originalBodyOverflow = null;
    this.originalBodyHeight = null;
    this.originalBodyPosition = null;
    this.originalScrollY = 0;
    this.lockReasons = new Set(); // Track which components are locking scroll
    this.isInitialized = false;
    
    // Debugging
    this.debugMode = localStorage.getItem('debug-scroll') === 'true';
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    // Store original body styles
    this.originalBodyOverflow = document.body.style.overflow || '';
    this.originalBodyHeight = document.body.style.height || '';
    this.originalBodyPosition = document.body.style.position || '';
    
    this.isInitialized = true;
    
    if (this.debugMode) {
      console.log('[ScrollLockManager] Initialized');
    }
  }

  /**
   * Lock scroll with a specific reason (component name)
   * @param {string} reason - Component or reason for locking scroll
   */
  lock(reason = 'unknown') {
    try {
      this.lockCount++;
      this.lockReasons.add(reason);
      
      if (this.lockCount === 1) {
        // First lock - store scroll position and apply lock
        this.originalScrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Apply scroll lock
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.originalScrollY}px`;
        document.body.style.width = '100%';
        
        if (this.debugMode) {
          console.log(`[ScrollLockManager] Scroll locked by "${reason}" (count: ${this.lockCount})`);
        }
      } else if (this.debugMode) {
        console.log(`[ScrollLockManager] Additional lock by "${reason}" (count: ${this.lockCount})`);
      }
    } catch (error) {
      console.error(`[ScrollLockManager] Error in lock("${reason}"):`, error);
    }
  }

  /**
   * Unlock scroll for a specific reason
   * @param {string} reason - Component or reason for unlocking scroll
   */
  unlock(reason = 'unknown') {
    try {
      if (this.lockCount <= 0) {
        if (this.debugMode) {
          console.warn(`[ScrollLockManager] Attempted to unlock scroll with "${reason}" but no locks exist`);
        }
        return;
      }

      this.lockCount--;
      this.lockReasons.delete(reason);
      
      if (this.lockCount === 0) {
        // Last unlock - restore scroll
        this.restore();
        
        if (this.debugMode) {
          console.log(`[ScrollLockManager] Scroll unlocked by "${reason}" - fully restored`);
        }
      } else if (this.debugMode) {
        console.log(`[ScrollLockManager] Lock removed by "${reason}" (count: ${this.lockCount}, remaining: ${Array.from(this.lockReasons).join(', ')})`);
      }
    } catch (error) {
      console.error(`[ScrollLockManager] Error in unlock("${reason}"):`, error);
      // Force restoration on error
      this.forceUnlock();
    }
  }

  /**
   * Force unlock all scroll locks (emergency cleanup)
   */
  forceUnlock() {
    if (this.lockCount > 0) {
      if (this.debugMode) {
        console.warn(`[ScrollLockManager] Force unlock - had ${this.lockCount} locks from: ${Array.from(this.lockReasons).join(', ')}`);
      }
      
      this.lockCount = 0;
      this.lockReasons.clear();
      this.restore();
    }
  }

  /**
   * Restore original scroll position and body styles
   */
  restore() {
    // Restore body styles
    document.body.style.overflow = this.originalBodyOverflow;
    document.body.style.position = this.originalBodyPosition;
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = this.originalBodyHeight;
    
    // Restore scroll position
    if (this.originalScrollY > 0) {
      window.scrollTo(0, this.originalScrollY);
    }
    
    // Reset tracking variables
    this.originalScrollY = 0;
  }

  /**
   * Get current lock status for debugging
   */
  getStatus() {
    return {
      lockCount: this.lockCount,
      lockReasons: Array.from(this.lockReasons),
      isLocked: this.lockCount > 0,
      originalScrollY: this.originalScrollY
    };
  }

  /**
   * Emergency cleanup for page unload or navigation
   */
  cleanup() {
    if (this.lockCount > 0) {
      this.forceUnlock();
      logger.warn('ScrollLockManager', 'Emergency cleanup performed', this.getStatus());
    }
  }

  /**
   * Global emergency scroll restoration - called after scenario completion
   * This ensures scrolling always works regardless of modal state
   */
  static emergencyScrollRestoration() {
    try {
      // Force restore body styles to defaults
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      
      // Remove common modal classes that might prevent scrolling
      document.body.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      document.documentElement.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      
      // Force unlock the centralized manager
      if (typeof window !== 'undefined' && window.scrollLockManager) {
        window.scrollLockManager.forceUnlock();
      }
      
      console.log('[ScrollLockManager] Emergency scroll restoration completed');
      
      return true;
    } catch (error) {
      console.error('[ScrollLockManager] Emergency scroll restoration failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const scrollLockManager = new ScrollLockManager();

// Emergency cleanup on page unload
window.addEventListener('beforeunload', () => {
  scrollLockManager.cleanup();
});

// Global emergency scroll restoration on scenario completion
document.addEventListener('scenario-completed', () => {
  // Small delay to let modals close properly first
  setTimeout(() => {
    scrollLockManager.forceUnlock();
  }, 500);
});

document.addEventListener('scenario-modal-closed', () => {
  // Emergency scroll restoration when scenario modal closes
  setTimeout(() => {
    scrollLockManager.forceUnlock();
  }, 100);
});

// Global mutation observer to catch any direct body style changes
// and restore scroll if body overflow is stuck as hidden
if (typeof MutationObserver !== 'undefined') {
  const bodyObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'style' && 
          mutation.target === document.body) {
        // Check if body overflow is hidden but no locks are active
        const bodyOverflow = document.body.style.overflow;
        if (bodyOverflow === 'hidden' && scrollLockManager.lockCount === 0) {
          // Emergency restoration - someone set overflow hidden without using the manager
          setTimeout(() => {
            if (scrollLockManager.lockCount === 0) {
              document.body.style.overflow = '';
              console.warn('[ScrollLockManager] Detected unauthorized scroll lock, restored');
            }
          }, 1000); // Give a second for legitimate locks to register
        }
      }
    });
  });
  
  // Start observing body style changes
  bodyObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['style']
  });
}

// Debug utility
if (typeof window !== 'undefined') {
  window.scrollLockManager = scrollLockManager;
  window.debugScrollLock = () => console.log(scrollLockManager.getStatus());
  window.emergencyScrollRestore = () => ScrollLockManager.emergencyScrollRestoration();
}

export default scrollLockManager;
