/**
 * CSS Styles for Intentional Logout Manager
 * Modern, accessible styles for logout modals and notifications
 */

const logoutCSS = `
/* Intentional Logout Modal */
.intentional-logout-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10010;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.logout-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: logoutFadeIn 0.3s ease-out;
}

@keyframes logoutFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.logout-modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: logoutSlideUp 0.3s ease-out;
  position: relative;
}

@keyframes logoutSlideUp {
  from {
    transform: translateY(50px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.logout-modal-header {
  padding: 24px 24px 16px 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.logout-modal-icon {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.logout-modal-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.logout-modal-body {
  padding: 20px 24px;
  text-align: center;
}

.logout-modal-message {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
  font-weight: 500;
}

.logout-modal-reason {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.logout-countdown {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #856404;
  text-align: center;
  font-family: monospace;
  animation: logoutPulse 2s infinite ease-in-out;
}

@keyframes logoutPulse {
  0%, 100% {
    background: #fff3cd;
  }
  50% {
    background: #ffeaa7;
  }
}

.logout-modal-actions {
  padding: 20px 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.logout-action-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  text-align: center;
}

.logout-action-btn.primary {
  background: #007bff;
  color: white;
}

.logout-action-btn.primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.logout-action-btn.secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.logout-action-btn.secondary:hover {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logout-action-btn:active {
  transform: translateY(0);
}

.logout-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Warning-specific styles */
.intentional-logout-modal[data-type="warning"] .logout-modal-header {
  border-bottom-color: #ffeaa7;
}

.intentional-logout-modal[data-type="warning"] .logout-modal-title {
  color: #856404;
}

.intentional-logout-modal[data-type="warning"] .logout-modal-reason {
  background: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

/* Security logout styles */
.intentional-logout-modal[data-type="security"] .logout-modal-header {
  border-bottom-color: #f5c6cb;
}

.intentional-logout-modal[data-type="security"] .logout-modal-title {
  color: #721c24;
}

.intentional-logout-modal[data-type="security"] .logout-modal-reason {
  background: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

/* Session timeout notification */
.session-timeout-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10005;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px 20px;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: logoutSlideIn 0.3s ease-out;
}

@keyframes logoutSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.session-timeout-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.session-timeout-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.session-timeout-message {
  flex: 1;
}

.session-timeout-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #856404;
}

.session-timeout-text {
  margin: 0;
  font-size: 13px;
  color: #856404;
  line-height: 1.4;
}

.session-timeout-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.session-timeout-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-timeout-btn.primary {
  background: #ffc107;
  color: #856404;
}

.session-timeout-btn.primary:hover {
  background: #e0a800;
}

.session-timeout-btn.secondary {
  background: transparent;
  color: #856404;
  text-decoration: underline;
}

.session-timeout-btn.secondary:hover {
  color: #533f03;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .logout-modal-overlay {
    padding: 10px;
  }
  
  .logout-modal-content {
    max-height: 95vh;
  }
  
  .logout-modal-header {
    padding: 20px 20px 12px 20px;
  }
  
  .logout-modal-body {
    padding: 16px 20px;
  }
  
  .logout-modal-actions {
    padding: 16px 20px 20px 20px;
    flex-direction: column;
  }
  
  .logout-action-btn {
    width: 100%;
    min-width: auto;
  }
  
  .session-timeout-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .logout-modal-content {
    border: 2px solid #000;
  }
  
  .logout-action-btn.primary {
    border: 2px solid #000;
  }
  
  .logout-action-btn.secondary {
    border: 2px solid #666;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .logout-modal-overlay,
  .logout-modal-content,
  .session-timeout-notification {
    animation: none;
  }
  
  .logout-action-btn:hover {
    transform: none;
  }
  
  .logoutPulse {
    animation: none;
  }
}

/* Focus management */
.logout-action-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.logout-action-btn:focus:not(:focus-visible) {
  outline: none;
}

/* Print styles */
@media print {
  .intentional-logout-modal,
  .session-timeout-notification {
    display: none;
  }
}
`;

// Inject CSS styles
if (!document.querySelector('#intentional-logout-styles')) {
  const style = document.createElement('style');
  style.id = 'intentional-logout-styles';
  style.textContent = logoutCSS;
  document.head.appendChild(style);
}

// Export CSS string for bundling
if (typeof module !== 'undefined' && module.exports) {
  module.exports = logoutCSS;
} else {
  window.IntentionalLogoutCSS = logoutCSS;
}
