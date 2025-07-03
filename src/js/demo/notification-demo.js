/**
 * Demo script for testing the Notification/Toast Component
 * This can be removed in production
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Add demo buttons to test toast notifications
  const demoButtons = document.createElement('div');
  demoButtons.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; z-index: 9999; display: flex; gap: 8px; flex-wrap: wrap;">
            <button id="demo-success" style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Success Toast</button>
            <button id="demo-error" style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Error Toast</button>
            <button id="demo-warning" style="padding: 8px 12px; background: #f59e0b; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Warning Toast</button>
            <button id="demo-info" style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Info Toast</button>
        </div>
    `;
  document.body.appendChild(demoButtons);

  // Add event listeners for demo buttons
  document.getElementById('demo-success').addEventListener('click', () => {
    window.NotificationToast.success(
      'Simulation Complete!',
      'You successfully navigated the ethical dilemma with a high ethics score.'
    );
  });

  document.getElementById('demo-error').addEventListener('click', () => {
    window.NotificationToast.error(
      'Connection Failed',
      'Unable to save your progress. Please check your internet connection and try again.'
    );
  });

  document.getElementById('demo-warning').addEventListener('click', () => {
    window.NotificationToast.warning(
      'Ethical Concern',
      'Your recent decision may have unintended consequences. Consider reviewing the scenario.'
    );
  });

  document.getElementById('demo-info').addEventListener('click', () => {
    window.NotificationToast.info(
      'New Feature Available',
      'The Analytics Dashboard now includes bias detection metrics for better insights.'
    );
  });

  // Integrate with existing app events

  // Example: Show success toast when start learning button is clicked
  const startLearningBtn = document.getElementById('start-learning');
  if (startLearningBtn) {
    startLearningBtn.addEventListener('click', () => {
      window.NotificationToast.success(
        'Welcome to SimulateAI!',
        'Begin your open-ended exploration of AI ethics and emerging technologies.'
      );
    });
  }

  // Example: Show info toast when educator guide is clicked
  const educatorGuideBtn = document.getElementById('educator-guide');
  if (educatorGuideBtn) {
    educatorGuideBtn.addEventListener('click', () => {
      window.NotificationToast.info(
        'Educator Resources',
        'Access comprehensive teaching materials and assessment tools.'
      );
    });
  }

  // Example: Error handling integration
  window.addEventListener('error', _event => {
    window.NotificationToast.error(
      'Application Error',
      'An unexpected error occurred. The development team has been notified.'
    );
  });

  // Example: Accessibility toggle feedback
  const accessibilityButtons = document.querySelectorAll(
    '.accessibility-controls button'
  );
  accessibilityButtons.forEach(button => {
    button.addEventListener('click', () => {
      const label = button.getAttribute('aria-label');
      const isPressed = button.getAttribute('aria-pressed') === 'true';

      window.NotificationToast.info(
        'Accessibility Setting',
        `${label} ${isPressed ? 'disabled' : 'enabled'}.`
      );
    });
  });
});
