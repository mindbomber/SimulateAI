/**
 * Test Setup and Utilities
 * Basic testing framework for SimulateAI components
 */

class TestFramework {
  constructor() {
    this.tests = [];
    this.currentSuite = null;
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  describe(suiteName, callback) {
    console.group(`📋 Test Suite: ${suiteName}`);
    this.currentSuite = suiteName;
    callback();
    this.currentSuite = null;
    console.groupEnd();
  }

  it(testName, callback) {
    this.results.total++;
    
    try {
      callback();
      this.results.passed++;
      console.log(`✅ ${testName}`);
    } catch (error) {
      this.results.failed++;
      console.error(`❌ ${testName}: ${error.message}`);
    }
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${expected}, but got ${actual}`);
        }
      },
      
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      
      toBeTrue: () => {
        if (actual !== true) {
          throw new Error(`Expected true, but got ${actual}`);
        }
      },
      
      toBeFalse: () => {
        if (actual !== false) {
          throw new Error(`Expected false, but got ${actual}`);
        }
      },
      
      toBeNull: () => {
        if (actual !== null) {
          throw new Error(`Expected null, but got ${actual}`);
        }
      },
      
      toBeUndefined: () => {
        if (actual !== undefined) {
          throw new Error(`Expected undefined, but got ${actual}`);
        }
      },
      
      toContain: (expected) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`);
        }
      },
      
      toThrow: () => {
        let thrown = false;
        try {
          actual();
        } catch (error) {
          thrown = true;
        }
        if (!thrown) {
          throw new Error('Expected function to throw an error');
        }
      }
    };
  }

  beforeEach(callback) {
    this.beforeEachCallback = callback;
  }

  afterEach(callback) {
    this.afterEachCallback = callback;
  }

  runTests() {
    console.log('\n🧪 Running SimulateAI Tests...\n');
    
    // Run all registered tests
    this.tests.forEach(test => {
      if (this.beforeEachCallback) {
        this.beforeEachCallback();
      }
      
      test();
      
      if (this.afterEachCallback) {
        this.afterEachCallback();
      }
    });

    // Display results
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total: ${this.results.total}`);
    console.log(`🎯 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%\n`);
  }
}

// Create global test instance
const test = new TestFramework();

// Accessibility testing utilities
class AccessibilityTester {
  static checkKeyboardNavigation(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    return {
      hasFocusableElements: focusableElements.length > 0,
      elementCount: focusableElements.length,
      elements: Array.from(focusableElements)
    };
  }

  static checkAriaLabels(element) {
    const interactiveElements = element.querySelectorAll(
      'button, input, select, textarea, [role="button"], [role="slider"]'
    );
    
    const elementsWithoutLabels = Array.from(interactiveElements).filter(el => {
      return !el.getAttribute('aria-label') && 
             !el.getAttribute('aria-labelledby') && 
             !el.querySelector('label');
    });
    
    return {
      totalInteractive: interactiveElements.length,
      missingLabels: elementsWithoutLabels.length,
      elements: elementsWithoutLabels
    };
  }

  static checkColorContrast(element) {
    // Basic color contrast check (simplified)
    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor;
    const textColor = style.color;
    
    return {
      backgroundColor: bgColor,
      textColor: textColor,
      // Note: Real contrast calculation would be more complex
      needsManualCheck: true
    };
  }
}

// DOM testing utilities
class DOMTester {
  static createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }

  static createTestContainer() {
    const container = document.createElement('div');
    container.id = 'test-container';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    return container;
  }

  static cleanupTestContainer() {
    const container = document.getElementById('test-container');
    if (container) {
      container.remove();
    }
  }

  static simulateClick(element) {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    element.dispatchEvent(event);
  }

  static simulateKeyPress(element, key) {
    const event = new KeyboardEvent('keydown', {
      key: key,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }
}

// Example test file structure
if (typeof window !== 'undefined') {
  // Run tests when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Example tests - these would be in separate test files

    test.describe('Core Engine Tests', () => {
      let engine;
      
      test.beforeEach(() => {
        const container = DOMTester.createTestContainer();
        engine = new SimulationEngine(container);
      });
      
      test.afterEach(() => {
        DOMTester.cleanupTestContainer();
      });
      
      test.it('should initialize with default settings', () => {
        test.expect(engine).toBe(engine);
        test.expect(engine.isRunning).toBeFalse();
      });
      
      test.it('should start and stop correctly', () => {
        engine.start();
        test.expect(engine.isRunning).toBeTrue();
        
        engine.stop();
        test.expect(engine.isRunning).toBeFalse();
      });
    });

    test.describe('Accessibility Tests', () => {
      test.it('should have proper keyboard navigation', () => {
        const container = DOMTester.createTestContainer();
        const ui = new UI(container);
        
        const button = ui.createButton({
          text: 'Test Button',
          onClick: () => {}
        });
        
        const navCheck = AccessibilityTester.checkKeyboardNavigation(container);
        test.expect(navCheck.hasFocusableElements).toBeTrue();
        test.expect(navCheck.elementCount).toBe(1);
        
        DOMTester.cleanupTestContainer();
      });
      
      test.it('should have proper ARIA labels', () => {
        const container = DOMTester.createTestContainer();
        const ui = new UI(container);
        
        const slider = ui.createSlider({
          label: 'Test Slider',
          min: 0,
          max: 100,
          value: 50
        });
        
        const ariaCheck = AccessibilityTester.checkAriaLabels(container);
        test.expect(ariaCheck.missingLabels).toBe(0);
        
        DOMTester.cleanupTestContainer();
      });
    });

    // Only run tests in development mode
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      test.runTests();
    }
  });
}

// Export utilities
if (typeof window !== 'undefined') {
  window.TestFramework = TestFramework;
  window.AccessibilityTester = AccessibilityTester;
  window.DOMTester = DOMTester;
}
