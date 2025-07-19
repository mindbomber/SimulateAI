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
 * Settings Manager Component
 * Professional settings system with floating tab controls and donor privileges
 * Enhanced with comprehensive user engagement tracking
 */

import { userEngagementTracker } from '../services/user-engagement-tracker.js';

// Constants
const SETTINGS_STORAGE_KEY = 'simulateai_settings';
const DONOR_STATUS_KEY = 'simulateai_donor_status';
const NOTIFICATION_DURATION = 5000;
const ANIMATION_DURATION = 300;
const DESKTOP_BREAKPOINT = 768;
const TOAST_DELAY = 500;
const SETTINGS_INIT_DELAY = 100;
const SETTINGS_LATE_APPLY_DELAY = 200;

class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.isDonor = this.checkDonorStatus();
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    this.setupEventListeners();
    this.updateUI();

    // Apply settings after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.applySettings();
    }, SETTINGS_INIT_DELAY);

    // Also apply settings when window is fully loaded (for Chart.js and other libraries)
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.applySettings();
      }, SETTINGS_LATE_APPLY_DELAY);
    });

    this.isInitialized = true;

    // Watch for dynamically added content and reapply styles
    this.setupMutationObserver();

    // Notify that settings manager is ready
    window.dispatchEvent(
      new CustomEvent('settingsManagerReady', {
        detail: {
          settings: this.settings,
          isDonor: this.isDonor,
        },
      })
    );
  }

  setupMutationObserver() {
    // Watch for new radar chart containers being added
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const radarCharts =
                node.querySelectorAll &&
                node.querySelectorAll('.radar-chart-container');
              const heroRadarDemos =
                node.querySelectorAll &&
                node.querySelectorAll('.hero-radar-demo');
              const scenarioCards =
                node.querySelectorAll &&
                node.querySelectorAll('.scenario-card');
              const viewToggleControls =
                node.querySelectorAll &&
                node.querySelectorAll('.view-toggle-controls');
              const mainNavElements =
                node.querySelectorAll && node.querySelectorAll('.main-nav');

              if (
                (radarCharts && radarCharts.length > 0) ||
                (heroRadarDemos && heroRadarDemos.length > 0) ||
                (scenarioCards && scenarioCards.length > 0) ||
                (viewToggleControls && viewToggleControls.length > 0) ||
                (mainNavElements && mainNavElements.length > 0)
              ) {
                // Reapply appearance settings after a short delay
                setTimeout(() => {
                  this.applyAppearanceSettings();
                }, 100);
              }
              // Also check if the node itself is a component we need to update
              if (
                node.classList &&
                (node.classList.contains('radar-chart-container') ||
                  node.classList.contains('hero-radar-demo') ||
                  node.classList.contains('scenario-card') ||
                  node.classList.contains('view-toggle-controls') ||
                  node.classList.contains('main-nav'))
              ) {
                setTimeout(() => {
                  this.applyAppearanceSettings();
                }, 100);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  forceDarkModeComponents() {
    // Find all radar chart containers and force dark mode styles
    const radarCharts = document.querySelectorAll('.radar-chart-container');
    radarCharts.forEach(chart => {
      chart.style.background =
        'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)';
      chart.style.borderColor = '#444444';
      chart.style.color = '#ffffff';
      chart.style.boxShadow =
        '0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)';
    });

    // Also handle hero-radar-demo containers
    const heroRadarDemos = document.querySelectorAll('.hero-radar-demo');
    heroRadarDemos.forEach(demo => {
      demo.style.background =
        'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
      demo.style.borderColor = '#444444';
      demo.style.color = '#ffffff';

      // Update text elements inside hero-radar-demo
      const h3 = demo.querySelector('h3');
      if (h3) {
        h3.style.color = '#ffffff';
        h3.style.background =
          'linear-gradient(135deg, #6bb4ff 0%, #9d4edd 100%)';
        h3.style.webkitBackgroundClip = 'text';
        h3.style.webkitTextFillColor = 'transparent';
        h3.style.backgroundClip = 'text';
      }

      const p = demo.querySelector('p');
      if (p) {
        p.style.color = '#cccccc';
      }
    });

    // Handle scenario cards
    const scenarioCards = document.querySelectorAll('.scenario-card');
    scenarioCards.forEach(card => {
      card.style.background = '#2d2d2d';
      card.style.borderColor = '#444444';
      card.style.color = '#ffffff';
      card.style.boxShadow =
        '0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)';

      // Update scenario header
      const header = card.querySelector('.scenario-header');
      if (header) {
        header.style.background = 'transparent';
        header.style.color = '#ffffff';
      }

      // Update scenario content
      const content = card.querySelector('.scenario-content');
      if (content) {
        content.style.background = 'transparent';
        content.style.color = '#ffffff';
      }

      // Update scenario title
      const title = card.querySelector('.scenario-title');
      if (title) {
        title.style.color = '#ffffff';
      }

      // Update scenario description
      const description = card.querySelector('.scenario-description');
      if (description) {
        description.style.color = '#cccccc';
      }

      // Update scenario footer
      const footer = card.querySelector('.scenario-footer');
      if (footer) {
        footer.style.color = '#cccccc';
      }

      // Update scenario icon
      const icon = card.querySelector('.scenario-icon');
      if (icon) {
        icon.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        icon.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      }

      // Update scenario difficulty
      const difficulty = card.querySelector('.scenario-difficulty');
      if (difficulty) {
        difficulty.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        difficulty.style.color = '#ffffff';
        difficulty.style.border = '1px solid rgba(255, 255, 255, 0.2)';
      }

      // Update scenario buttons
      const startBtn = card.querySelector('.scenario-start-btn');
      if (startBtn) {
        startBtn.style.backgroundColor = '#4a9eff';
        startBtn.style.color = '#ffffff';
        startBtn.style.border = '1px solid #4a9eff';
      }

      const quickStartBtn = card.querySelector('.scenario-quick-start-btn');
      if (quickStartBtn) {
        quickStartBtn.style.backgroundColor = '#4a9eff';
        quickStartBtn.style.color = '#ffffff';
        quickStartBtn.style.border = '1px solid #4a9eff';
      }
    });

    // Handle view toggle controls
    const viewToggleControls = document.querySelector('.view-toggle-controls');
    if (viewToggleControls) {
      viewToggleControls.style.background = '#2d2d2d';
      viewToggleControls.style.border = '1px solid #444444';
    }

    const viewToggleButtons = document.querySelectorAll('.view-toggle-btn');
    viewToggleButtons.forEach(btn => {
      btn.style.color = '#cccccc';
      btn.style.background = 'transparent';

      if (btn.classList.contains('active')) {
        btn.style.background = '#3d3d3d';
        btn.style.color = '#4a9eff';
        btn.style.boxShadow =
          '0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)';
      }
    });

    // Handle keyboard hint
    const keyboardHint = document.querySelector('.keyboard-hint');
    if (keyboardHint) {
      keyboardHint.style.color = '#cccccc';

      const hintText = keyboardHint.querySelector('.hint-text');
      if (hintText) {
        hintText.style.color = '#cccccc';
      }
    }

    const kbdElements = document.querySelectorAll('kbd');
    kbdElements.forEach(kbd => {
      kbd.style.background = '#3d3d3d';
      kbd.style.color = '#ffffff';
      kbd.style.border = '1px solid #555555';
      kbd.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    });

    // Handle main navigation
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
      mainNav.style.backgroundColor = '#2d2d2d';
    }

    // Handle nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.style.color = '#ffffff';
    });

    // Handle nav groups
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
      group.style.backgroundColor = 'transparent';
    });

    // Handle dropdown menus
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    dropdownMenus.forEach(menu => {
      menu.style.backgroundColor = '#2d2d2d';
      menu.style.borderColor = '#444';
      menu.style.color = '#ffffff';
    });

    // Handle dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.style.color = '#ffffff';
      item.style.backgroundColor = 'transparent';
    });
  }

  loadSettings() {
    const defaultSettings = {
      surpriseTabEnabled: true,
      tourTabEnabled: true,
      donateTabEnabled: true,
      // Theme & Appearance settings
      theme: 'auto', // 'light', 'dark', 'auto'
      fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
      highContrast: false,
      reducedMotion: false,
      largeClickTargets: false,
      // Notification settings
      notificationsEnabled: false,
      achievementNotifications: true,
      badgeNotifications: true,
      progressNotifications: true,
    };

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored
        ? { ...defaultSettings, ...JSON.parse(stored) }
        : defaultSettings;
    } catch (error) {
      // Failed to load settings, use defaults
      return defaultSettings;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      // Failed to save settings
    }
  }

  checkDonorStatus() {
    try {
      const donorStatus = localStorage.getItem(DONOR_STATUS_KEY);
      return donorStatus === 'true';
    } catch (error) {
      // Failed to check donor status
      return false;
    }
  }

  setDonorStatus(isDonor) {
    try {
      localStorage.setItem(DONOR_STATUS_KEY, isDonor.toString());
      this.isDonor = isDonor;
      this.updateUI();
    } catch (error) {
      // Failed to set donor status
    }
  }

  setupEventListeners() {
    // Surprise tab toggle
    const surpriseToggle = document.getElementById('toggle-surprise-tab');
    if (surpriseToggle) {
      surpriseToggle.addEventListener('change', e => {
        const oldValue = this.settings.surpriseTabEnabled;
        this.settings.surpriseTabEnabled = e.target.checked;

        // Track the settings change
        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'surpriseTabEnabled',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'interface',
          context: 'settings_panel',
        });

        this.saveSettings();
        this.applySettings();
      });
    }

    // Tour tab toggle
    const tourToggle = document.getElementById('toggle-tour-tab');
    if (tourToggle) {
      tourToggle.addEventListener('change', e => {
        const oldValue = this.settings.tourTabEnabled;
        this.settings.tourTabEnabled = e.target.checked;

        // Track the settings change
        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'tourTabEnabled',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'interface',
          context: 'settings_panel',
        });

        this.saveSettings();
        this.applySettings();
      });
    }

    // Donate tab toggle
    const donateToggle = document.getElementById('toggle-donate-tab');
    if (donateToggle) {
      donateToggle.addEventListener('change', e => {
        const oldValue = this.settings.donateTabEnabled;

        // Only donors can disable the donate tab
        if (!this.isDonor && !e.target.checked) {
          e.target.checked = true;
          this.showDonationRequiredMessage();

          // Track the restricted action
          userEngagementTracker.trackUserEvent('settings_restriction', {
            settingName: 'donateTabEnabled',
            attemptedValue: false,
            restrictionReason: 'non_donor',
            category: 'access_control',
            context: 'settings_panel',
          });

          return;
        }

        this.settings.donateTabEnabled = e.target.checked;

        // Track the settings change
        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'donateTabEnabled',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'interface',
          userType: this.isDonor ? 'donor' : 'regular',
          context: 'settings_panel',
        });

        this.saveSettings();
        this.applySettings();
      });
    }

    // Theme selection
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', e => {
        const oldValue = this.settings.theme;
        this.settings.theme = e.target.value;

        // Track the theme change
        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'theme',
          oldValue,
          newValue: e.target.value,
          settingType: 'select',
          category: 'appearance',
          context: 'settings_panel',
        });

        this.saveSettings();
        this.applySettings();
      });
    }

    // Font size selection
    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', e => {
        const oldValue = this.settings.fontSize;
        this.settings.fontSize = e.target.value;

        // Track the font size change
        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'fontSize',
          oldValue,
          newValue: e.target.value,
          settingType: 'select',
          category: 'accessibility',
          context: 'settings_panel',
        });

        this.saveSettings();
        this.applySettings();
      });
    }

    // High contrast toggle
    const highContrastToggle = document.getElementById('toggle-high-contrast');
    if (highContrastToggle) {
      highContrastToggle.addEventListener('change', e => {
        const oldValue = this.settings.highContrast;
        this.settings.highContrast = e.target.checked;

        // Track the accessibility setting change
        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'highContrast',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'accessibility',
          context: 'settings_panel',
        });

        this.saveSettings();
        this.applySettings();
      });
    }

    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById(
      'toggle-reduced-motion'
    );
    if (reducedMotionToggle) {
      reducedMotionToggle.addEventListener('change', e => {
        this.settings.reducedMotion = e.target.checked;
        this.saveSettings();
        this.applySettings();
      });
    }

    // Large click targets toggle
    const largeTargetsToggle = document.getElementById('toggle-large-targets');
    if (largeTargetsToggle) {
      largeTargetsToggle.addEventListener('change', e => {
        this.settings.largeClickTargets = e.target.checked;
        this.saveSettings();
        this.applySettings();
      });
    }

    // Notification event listeners
    this.setupNotificationEventListeners();

    // Settings dropdown toggle
    const settingsNav = document.getElementById('settings-nav');
    if (settingsNav) {
      settingsNav.addEventListener('click', e => {
        e.preventDefault();
        this.toggleSettingsDropdown();
      });
    }

    // Desktop hover behavior
    const settingsNavItem = settingsNav?.closest('.nav-item-dropdown');
    if (settingsNavItem) {
      // Open on hover (desktop only)
      settingsNavItem.addEventListener('mouseenter', () => {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
          this.openSettingsDropdown();
        }
      });

      // Close when leaving the dropdown area
      settingsNavItem.addEventListener('mouseleave', () => {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
          this.closeSettingsDropdown();
        }
      });
    }

    // Close settings on outside click
    document.addEventListener('click', e => {
      const settingsDropdown = document.querySelector('.settings-menu');
      const settingsNav = document.getElementById('settings-nav');

      if (
        settingsDropdown &&
        settingsNav &&
        !settingsDropdown.contains(e.target) &&
        !settingsNav.contains(e.target)
      ) {
        this.closeSettingsDropdown();
      }
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.settings.theme === 'auto') {
        this.applyAppearanceSettings();
      }
    });
  }

  updateUI() {
    // Update toggle states
    const surpriseToggle = document.getElementById('toggle-surprise-tab');
    const tourToggle = document.getElementById('toggle-tour-tab');
    const donateToggle = document.getElementById('toggle-donate-tab');
    const donorNote = document.getElementById('donor-note');

    if (surpriseToggle) {
      surpriseToggle.checked = this.settings.surpriseTabEnabled;
    }

    if (tourToggle) {
      tourToggle.checked = this.settings.tourTabEnabled;
    }

    if (donateToggle) {
      donateToggle.checked = this.settings.donateTabEnabled;

      // Handle donor-only functionality
      const donateToggleWrapper = donateToggle.closest('.settings-toggle');
      if (this.isDonor) {
        donateToggleWrapper.classList.remove('settings-disabled');
        donateToggle.disabled = false;
        if (donorNote) {
          donorNote.style.display = 'block';
        }
      } else {
        if (!this.settings.donateTabEnabled) {
          donateToggleWrapper.classList.add('settings-disabled');
          donateToggle.disabled = true;
        }
        if (donorNote) {
          donorNote.style.display = 'none';
        }
      }
    }

    // Update appearance settings
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.value = this.settings.theme;
    }

    const fontSizeSelect = document.getElementById('font-size-select');
    if (fontSizeSelect) {
      fontSizeSelect.value = this.settings.fontSize;
    }

    const highContrastToggle = document.getElementById('toggle-high-contrast');
    if (highContrastToggle) {
      highContrastToggle.checked = this.settings.highContrast;
    }

    const reducedMotionToggle = document.getElementById(
      'toggle-reduced-motion'
    );
    if (reducedMotionToggle) {
      reducedMotionToggle.checked = this.settings.reducedMotion;
    }

    const largeTargetsToggle = document.getElementById('toggle-large-targets');
    if (largeTargetsToggle) {
      largeTargetsToggle.checked = this.settings.largeClickTargets;
    }

    // Update notification settings
    this.updateNotificationUI();
  }

  applySettings() {
    // Apply appearance settings
    this.applyAppearanceSettings();

    // Only notify components - let them handle their own visibility
    this.notifySettingsChanged();
  }

  applyAppearanceSettings() {
    const { body } = document;
    const { documentElement: html } = document;
    const { documentElement: root } = document;

    // Apply theme
    body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    body.classList.add(`theme-${this.settings.theme}`);

    // Apply actual theme based on system preference for auto mode
    if (this.settings.theme === 'auto') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      body.classList.toggle('dark-mode', prefersDark);
    } else {
      body.classList.toggle('dark-mode', this.settings.theme === 'dark');
    }

    // Force apply dark mode styles if in dark mode
    if (body.classList.contains('dark-mode')) {
      this.forceDarkModeComponents();
    }

    // Update CSS custom properties for dynamic theming
    const isDarkMode = body.classList.contains('dark-mode');

    // Update theme-color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

    if (isDarkMode) {
      // Dark mode colors
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--text-secondary', '#cccccc');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--border-color', '#444444');
      root.style.setProperty('--primary-color', '#4a9eff');
      root.style.setProperty('--primary-accent', '#4a9eff');
      root.style.setProperty('--primary-dark', '#3a8eef');
      root.style.setProperty('--color-primary', '#4a9eff');
      root.style.setProperty('--color-primary-light', '#6bb4ff');
      root.style.setProperty('--color-primary-dark', '#3a8eef');
      root.style.setProperty('--hover-bg', '#3d3d3d');
      root.style.setProperty('--background-color', '#2d2d2d');
      root.style.setProperty('--color-gray-50', '#3d3d3d');
      root.style.setProperty('--color-gray-200', '#444444');
      root.style.setProperty('--color-gray-700', '#cccccc');
      root.style.setProperty('--color-gray-900', '#ffffff');
      root.style.setProperty('--color-white', '#2d2d2d');

      // Update meta tags for dark mode
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#2d2d2d');
      if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', 'dark');
    } else {
      // Light mode colors
      root.style.setProperty('--text-color', '#333333');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--text-primary', '#333333');
      root.style.setProperty('--border-color', '#e0e0e0');
      root.style.setProperty('--primary-color', '#1a73e8');
      root.style.setProperty('--primary-accent', '#3498db');
      root.style.setProperty('--primary-dark', '#2c3e50');
      root.style.setProperty('--color-primary', '#007cba');
      root.style.setProperty('--color-primary-light', '#4da6d9');
      root.style.setProperty('--color-primary-dark', '#005a87');
      root.style.setProperty('--hover-bg', '#f5f5f5');
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--color-gray-50', '#f9fafb');
      root.style.setProperty('--color-gray-200', '#e5e7eb');
      root.style.setProperty('--color-gray-700', '#374151');
      root.style.setProperty('--color-gray-900', '#111827');
      root.style.setProperty('--color-white', '#ffffff');

      // Update meta tags for light mode
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#667eea');
      if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', 'light');
    } // Apply font size
    html.classList.remove(
      'font-size-small',
      'font-size-medium',
      'font-size-large',
      'font-size-extra-large'
    );
    html.classList.add(`font-size-${this.settings.fontSize}`);

    // Apply accessibility settings
    body.classList.toggle('high-contrast', this.settings.highContrast);
    body.classList.toggle('reduced-motion', this.settings.reducedMotion);
    body.classList.toggle(
      'large-click-targets',
      this.settings.largeClickTargets
    );

    // Update CSS custom properties for high contrast mode
    if (this.settings.highContrast) {
      root.style.setProperty('--primary-color', '#000000');
      root.style.setProperty('--secondary-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--background-color', '#ffffff');
    }
  }

  notifySettingsChanged() {
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent('settingsChanged', {
        detail: {
          settings: this.settings,
          isDonor: this.isDonor,
        },
      })
    );
  }

  toggleSettingsDropdown() {
    const settingsNav = document.getElementById('settings-nav');
    const settingsMenu = document.querySelector('.settings-menu');

    if (settingsNav && settingsMenu) {
      const isExpanded = settingsNav.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      settingsNav.setAttribute('aria-expanded', newState);
      settingsMenu.style.display = newState ? 'block' : 'none';

      // Track settings panel interaction
      userEngagementTracker.trackUserEvent('settings_panel_interaction', {
        action: newState ? 'open' : 'close',
        trigger: 'click',
        method: 'toggle',
        context: 'navigation',
      });
    }
  }

  openSettingsDropdown() {
    const settingsNav = document.getElementById('settings-nav');
    const settingsMenu = document.querySelector('.settings-menu');

    if (settingsNav && settingsMenu) {
      const wasOpen = settingsNav.getAttribute('aria-expanded') === 'true';

      settingsNav.setAttribute('aria-expanded', 'true');
      settingsMenu.style.display = 'block';

      // Track settings panel open (if not already open)
      if (!wasOpen) {
        userEngagementTracker.trackUserEvent('settings_panel_interaction', {
          action: 'open',
          trigger: 'hover',
          method: 'direct',
          context: 'navigation',
        });
      }
    }
  }

  closeSettingsDropdown() {
    const settingsNav = document.getElementById('settings-nav');
    const settingsMenu = document.querySelector('.settings-menu');

    if (settingsNav && settingsMenu) {
      const wasOpen = settingsNav.getAttribute('aria-expanded') === 'true';

      settingsNav.setAttribute('aria-expanded', 'false');
      settingsMenu.style.display = 'none';

      // Track settings panel close (if was open)
      if (wasOpen) {
        userEngagementTracker.trackUserEvent('settings_panel_interaction', {
          action: 'close',
          trigger: 'hover_leave',
          method: 'direct',
          context: 'navigation',
        });
      }
    }
  }

  showDonationRequiredMessage() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'settings-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">💡</span>
        <span class="notification-text">Only donors can disable the donation tab</span>
        <button class="notification-close" aria-label="Close">&times;</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, ANIMATION_DURATION);
      }
    }, NOTIFICATION_DURATION);

    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });
    }
  }

  /**
   * Setup notification event listeners
   */
  setupNotificationEventListeners() {
    // Main notifications toggle
    const notificationsToggle = document.getElementById('toggle-notifications');
    if (notificationsToggle) {
      notificationsToggle.addEventListener('change', e => {
        this.handleNotificationToggle(e.target.checked);
      });
    }

    // Achievement notifications toggle
    const achievementToggle = document.getElementById(
      'toggle-achievement-notifications'
    );
    if (achievementToggle) {
      achievementToggle.addEventListener('change', e => {
        const oldValue = this.settings.achievementNotifications;
        this.settings.achievementNotifications = e.target.checked;

        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'achievementNotifications',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'notifications',
          context: 'settings_panel',
        });

        this.saveSettings();
      });
    }

    // Badge notifications toggle
    const badgeToggle = document.getElementById('toggle-badge-notifications');
    if (badgeToggle) {
      badgeToggle.addEventListener('change', e => {
        const oldValue = this.settings.badgeNotifications;
        this.settings.badgeNotifications = e.target.checked;

        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'badgeNotifications',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'notifications',
          context: 'settings_panel',
        });

        this.saveSettings();
      });
    }

    // Progress notifications toggle
    const progressToggle = document.getElementById(
      'toggle-progress-notifications'
    );
    if (progressToggle) {
      progressToggle.addEventListener('change', e => {
        const oldValue = this.settings.progressNotifications;
        this.settings.progressNotifications = e.target.checked;

        userEngagementTracker.trackUserEvent('settings_change', {
          settingName: 'progressNotifications',
          oldValue,
          newValue: e.target.checked,
          settingType: 'toggle',
          category: 'notifications',
          context: 'settings_panel',
        });

        this.saveSettings();
      });
    }

    // Initialize notification status
    this.checkNotificationPermission();
  }

  /**
   * Handle main notification toggle
   */
  async handleNotificationToggle(enabled) {
    const oldValue = this.settings.notificationsEnabled;

    if (enabled) {
      // Check if notifications are already blocked/denied
      if (Notification.permission === 'denied') {
        // Don't try to request permission again - it's blocked
        this.settings.notificationsEnabled = false;
        const toggle = document.getElementById('toggle-notifications');
        if (toggle) toggle.checked = false;
        this.updateNotificationStatus('denied');
        this.showHowToUnblockNotifications();
        return;
      }

      // Request permission if enabling
      const permission = await this.requestNotificationPermission();
      this.settings.notificationsEnabled = permission === 'granted';

      if (permission === 'granted') {
        this.showNotificationSubOptions(true);
        this.initializeFCM();
      } else {
        // Reset toggle if permission denied
        const toggle = document.getElementById('toggle-notifications');
        if (toggle) toggle.checked = false;
        this.updateNotificationStatus(permission);
        if (permission === 'denied') {
          this.showHowToUnblockNotifications();
        }
      }
    } else {
      this.settings.notificationsEnabled = false;
      this.showNotificationSubOptions(false);
      this.updateNotificationStatus('disabled');
    }

    userEngagementTracker.trackUserEvent('settings_change', {
      settingName: 'notificationsEnabled',
      oldValue,
      newValue: this.settings.notificationsEnabled,
      settingType: 'toggle',
      category: 'notifications',
      permissionResult: Notification.permission,
      context: 'settings_panel',
    });

    this.saveSettings();
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.updateNotificationStatus('unsupported');
      return 'denied';
    }

    // Check if already denied/blocked
    if (Notification.permission === 'denied') {
      this.updateNotificationStatus('denied');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.updateNotificationStatus(permission);
      return permission;
    } catch (error) {
      // Error requesting notification permission - this can happen when blocked
      this.updateNotificationStatus('denied');
      return 'denied';
    }
  }

  /**
   * Check current notification permission
   */
  checkNotificationPermission() {
    if (!('Notification' in window)) {
      this.updateNotificationStatus('unsupported');
      return;
    }

    const { permission } = Notification;
    this.updateNotificationStatus(permission);

    // Update settings based on actual permission
    if (permission === 'granted' && this.settings.notificationsEnabled) {
      this.showNotificationSubOptions(true);
    } else {
      this.settings.notificationsEnabled = false;
      this.showNotificationSubOptions(false);

      // Update the toggle to reflect the correct state
      const toggle = document.getElementById('toggle-notifications');
      if (toggle) {
        toggle.checked = false;
      }

      this.saveSettings();
    }
  }

  /**
   * Update notification status display
   */
  updateNotificationStatus(status) {
    const toggle = document.getElementById('toggle-notifications');

    if (!toggle) return;

    // Update toggle state
    if (status === 'granted' && this.settings.notificationsEnabled) {
      toggle.checked = true;
    } else {
      toggle.checked = false;
    }

    // Show a toast for important status changes
    if (status === 'denied' || status === 'error' || status === 'unsupported') {
      // Auto-show toast for problematic states
      setTimeout(() => {
        this.showNotificationStatusToast(status);
      }, TOAST_DELAY); // Small delay to ensure UI is ready
    }
  }

  /**
   * Show/hide notification sub-options
   */
  showNotificationSubOptions(show) {
    const sections = [
      'notification-types-section',
      'notification-badges-section',
      'notification-progress-section',
    ];

    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = show ? 'block' : 'none';
      }
    });
  }

  /**
   * Show notification status information as a toast popup
   */
  showNotificationStatusToast(status) {
    if (!window.NotificationToast) {
      // Fallback if toast system isn't available
      this.showNotificationStatusFallback(status);
      return;
    }

    const toastConfigs = {
      granted: {
        type: 'success',
        title: '🔔 Notifications Enabled',
        message:
          'You will receive notifications for achievements, badges, and progress updates. You can customize these in the settings below.',
        duration: 5000,
      },
      denied: {
        type: 'warning',
        title: '🚫 Notifications Blocked',
        message: `To enable notifications:
        1. Click the lock/info icon next to the URL
        2. Change notifications from "Block" to "Allow"
        3. Refresh the page and toggle notifications on`,
        duration: 8000,
      },
      default: {
        type: 'info',
        title: '🔔 Enable Notifications?',
        message:
          "Toggle the switch above to enable notifications. You'll be asked for permission to show notifications from SimulateAI.",
        duration: 5000,
      },
      unsupported: {
        type: 'error',
        title: '❌ Notifications Not Supported',
        message:
          "Your browser doesn't support notifications. Consider updating your browser or switching to a modern browser like Chrome, Firefox, or Safari.",
        duration: 6000,
      },
      disabled: {
        type: 'info',
        title: '🔕 Notifications Disabled',
        message:
          'Notifications are currently turned off. Toggle the switch above to enable notifications for achievements and progress updates.',
        duration: 4000,
      },
      error: {
        type: 'error',
        title: '⚠️ Notification Error',
        message:
          'There was an error with the notification system. Try refreshing the page or check your browser settings.',
        duration: 6000,
      },
    };

    const config = toastConfigs[status] || {
      type: 'info',
      title: 'Notification Status',
      message: 'Click the toggle above to manage notification settings.',
      duration: 4000,
    };

    window.NotificationToast.show({
      ...config,
      closable: true,
    });
  }

  /**
   * Fallback method for showing notification status without toast system
   */
  showNotificationStatusFallback(status) {
    const messages = {
      granted:
        'Notifications are enabled! You will receive alerts for achievements, badges, and progress updates.',
      denied:
        'Notifications are blocked. To enable:\n1. Click the lock icon next to the URL\n2. Change notifications to "Allow"\n3. Refresh and try again',
      default:
        "Click the toggle above to enable notifications. You'll be asked for permission.",
      unsupported:
        "Your browser doesn't support notifications. Consider updating your browser.",
      disabled:
        'Notifications are currently disabled. Use the toggle above to enable them.',
      error: 'There was an error with notifications. Try refreshing the page.',
    };

    alert(
      messages[status] ||
        'Click the toggle above to manage notification settings.'
    );
  }

  /**
   * Show instructions on how to unblock notifications
   */
  showHowToUnblockNotifications() {
    // Use the new toast system for consistent messaging
    this.showNotificationStatusToast('denied');
  }

  /**
   * Initialize FCM if notifications are enabled
   */
  async initializeFCM() {
    try {
      // Check if FCM is available
      if (
        window.fcmMainApp &&
        typeof window.fcmMainApp.initialize === 'function'
      ) {
        await window.fcmMainApp.initialize();
      } else {
        // Dynamically import FCM if not already loaded
        const { default: fcmMainApp } = await import('../fcm-main-app.js');
        await fcmMainApp.initialize();
      }
    } catch (error) {
      // Failed to initialize FCM - notification system will continue to work without push notifications
    }
  }

  /**
   * Send a test notification (for debugging)
   */
  sendTestNotification() {
    if (
      !this.settings.notificationsEnabled ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    new Notification('SimulateAI Test', {
      body: 'Notifications are working correctly!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }

  /**
   * Get notification settings for external use
   */
  getNotificationSettings() {
    return {
      enabled: this.settings.notificationsEnabled,
      achievements: this.settings.achievementNotifications,
      badges: this.settings.badgeNotifications,
      progress: this.settings.progressNotifications,
      permission: Notification.permission,
    };
  }

  /**
   * Update notification UI elements
   */
  updateNotificationUI() {
    // Update notification toggles
    const notificationsToggle = document.getElementById('toggle-notifications');
    const achievementToggle = document.getElementById(
      'toggle-achievement-notifications'
    );
    const badgeToggle = document.getElementById('toggle-badge-notifications');
    const progressToggle = document.getElementById(
      'toggle-progress-notifications'
    );

    if (notificationsToggle) {
      notificationsToggle.checked = this.settings.notificationsEnabled;
    }

    if (achievementToggle) {
      achievementToggle.checked = this.settings.achievementNotifications;
    }

    if (badgeToggle) {
      badgeToggle.checked = this.settings.badgeNotifications;
    }

    if (progressToggle) {
      progressToggle.checked = this.settings.progressNotifications;
    }

    // Show/hide sub-options based on main toggle
    this.showNotificationSubOptions(this.settings.notificationsEnabled);

    // Update status
    this.checkNotificationPermission();
  }

  // Public API methods
  getSetting(key) {
    return this.settings[key];
  }

  setSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
    this.applySettings();
    this.updateUI();
  }

  reset() {
    this.settings = {
      surpriseTabEnabled: true,
      tourTabEnabled: true,
      donateTabEnabled: true,
      theme: 'auto',
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      largeClickTargets: false,
    };
    this.saveSettings();
    this.applySettings();
    this.updateUI();
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for shared navigation to inject HTML
  setTimeout(() => {
    if (!window.settingsManager) {
      window.settingsManager = new SettingsManager();
    }
  }, 100);
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!window.settingsManager) {
        window.settingsManager = new SettingsManager();
      }
    }, 100);
  });
} else {
  // DOM is already loaded - wait for navigation to be injected
  setTimeout(() => {
    if (!window.settingsManager) {
      window.settingsManager = new SettingsManager();
    }
  }, 100);
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
  }

  .notification-close:hover {
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

export default SettingsManager;
