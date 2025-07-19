/**
 * Typewriter Effect Utility
 * Creates a typewriter animation effect for text elements
 */

// Constants
const CURSOR_REMOVE_DELAY = 500;

/**
 * Apply typewriter effect to an element
 * @param {HTMLElement} element - The element to apply the effect to
 * @param {string} text - The text to type out
 * @param {Object} options - Configuration options
 * @param {number} options.speed - Typing speed in milliseconds per character (default: 50)
 * @param {number} options.delay - Initial delay before starting (default: 0)
 * @param {boolean} options.cursor - Whether to show a blinking cursor (default: true)
 * @param {Function} options.onComplete - Callback when typing is complete
 * @returns {Promise} Promise that resolves when typing is complete
 */
export function typewriterEffect(element, text, options = {}) {
  return new Promise(resolve => {
    const { speed = 50, delay = 0, cursor = true, onComplete = null } = options;

    // Clear existing content
    element.textContent = '';

    // Add cursor if enabled
    if (cursor) {
      element.innerHTML = '<span class="typewriter-cursor">|</span>';
    }

    // Start typing after delay
    setTimeout(() => {
      let index = 0;
      const textArray = text.split('');

      const typeTimer = setInterval(() => {
        if (index < textArray.length) {
          // Remove cursor, add character, add cursor back
          if (cursor) {
            const currentText = text.substring(0, index + 1);
            const cursorSpan = '<span class="typewriter-cursor">|</span>';
            element.innerHTML = `${currentText}${cursorSpan}`;
          } else {
            element.textContent = text.substring(0, index + 1);
          }
          index++;
        } else {
          // Typing complete
          clearInterval(typeTimer);

          // Remove cursor after a brief delay
          if (cursor) {
            setTimeout(() => {
              element.innerHTML = text;
            }, CURSOR_REMOVE_DELAY);
          }

          if (onComplete) {
            onComplete();
          }
          resolve();
        }
      }, speed);
    }, delay);
  });
}

/**
 * Apply typewriter effect to multiple elements sequentially
 * @param {Array} elements - Array of {element, text, options} objects
 * @returns {Promise} Promise that resolves when all typing is complete
 */
export async function typewriterSequence(elements) {
  for (const item of elements) {
    await typewriterEffect(item.element, item.text, item.options);
  }
}

/**
 * Apply typewriter effect to multiple elements simultaneously
 * @param {Array} elements - Array of {element, text, options} objects
 * @returns {Promise} Promise that resolves when all typing is complete
 */
export async function typewriterParallel(elements) {
  const promises = elements.map(item =>
    typewriterEffect(item.element, item.text, item.options)
  );
  return Promise.all(promises);
}
