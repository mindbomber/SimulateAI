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
 * Back to Top Component - FIXED VERSION
 * A simple, reliable back-to-top button that appears after scrolling
 * three viewport heights and smoothly scrolls back to the top.
 */

console.log('🔝 BackToTop component loading...');

class BackToTop {
  constructor() {
    console.log('🔝 BackToTop constructor called');
    this.button = null;
    this.isVisible = false;
    this.threshold = window.innerHeight * 3; // Exactly 3 viewport heights

    console.log(
      `🔝 Threshold set to: ${this.threshold}px (3x viewport height: ${window.innerHeight}px)`
    );

    this.init();
  }

  init() {
    console.log('🔝 BackToTop initializing...');
    this.createButton();
    this.setupEventListeners();
    this.updateVisibility();
    console.log('🔝 BackToTop initialized successfully');
  }

  createButton() {
    console.log('🔝 Creating button...');

    // Remove any existing button
    const existing = document.getElementById('back-to-top');
    if (existing) {
      existing.remove();
      console.log('🔝 Removed existing button');
    }

    this.button = document.createElement('button');
    this.button.id = 'back-to-top';
    this.button.className = 'back-to-top';
    this.button.setAttribute('aria-label', 'Back to top');
    this.button.innerHTML = '↑';

    // Apply inline styles for immediate visibility
    Object.assign(this.button.style, {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '50%',
      border: '2px solid #007acc',
      backgroundColor: 'transparent',
      color: '#007acc',
      fontSize: '1.8rem',
      cursor: 'pointer',
      zIndex: '99999',
      opacity: '0',
      visibility: 'hidden',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0, 122, 204, 0.2)',
      fontWeight: 'bold',
    });

    document.body.appendChild(this.button);
    console.log('🔝 Button created and added to page');
  }

  setupEventListeners() {
    console.log('🔝 Setting up event listeners...');

    let throttleTimer = null;

    const throttledScroll = () => {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        this.updateVisibility();
        throttleTimer = null;
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    this.button.addEventListener('click', e => {
      e.preventDefault();
      console.log('🔝 Button clicked!');
      this.scrollToTop();
    });

    // Hover effects
    this.button.addEventListener('mouseenter', () => {
      this.button.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';
      this.button.style.borderColor = '#005a9e';
      this.button.style.color = '#005a9e';
      this.button.style.transform = 'scale(1.1)';
    });

    this.button.addEventListener('mouseleave', () => {
      this.button.style.backgroundColor = 'transparent';
      this.button.style.borderColor = '#007acc';
      this.button.style.color = '#007acc';
      this.button.style.transform = 'scale(1)';
    });

    console.log('🔝 Event listeners set up successfully');
  }

  updateVisibility() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const shouldShow = scrollY > this.threshold;

    console.log(
      `🔝 Scroll: ${Math.round(scrollY)}px, Threshold: ${this.threshold}px, Should show: ${shouldShow}`
    );

    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;

      if (shouldShow) {
        this.button.style.opacity = '1';
        this.button.style.visibility = 'visible';
        console.log('🔝 ✅ Button SHOWN');
      } else {
        this.button.style.opacity = '0';
        this.button.style.visibility = 'hidden';
        console.log('🔝 ❌ Button HIDDEN');
      }
    }
  }

  scrollToTop() {
    console.log('🔝 Scrolling to top...');

    // Hide immediately
    this.button.style.opacity = '0';
    this.isVisible = false;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Recheck visibility after animation
    setTimeout(() => {
      this.updateVisibility();
    }, 600);
  }
}

// Initialize immediately when script loads
console.log('🔝 Creating BackToTop instance...');
const backToTopInstance = new BackToTop();

// Also make it globally accessible for debugging
window.BackToTop = backToTopInstance;

// Backup initialization on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔝 DOM ready, ensuring BackToTop is initialized');
    if (!document.getElementById('back-to-top')) {
      new BackToTop();
    }
  });
} else {
  console.log('🔝 DOM already ready');
}

export default BackToTop;

