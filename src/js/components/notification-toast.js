/**
 * Notification/Toast Component
 * Provides accessible, customizable toast notifications
 */

class NotificationToast {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(this.container);
    }

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message
     * @param {number} options.duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
     * @param {boolean} options.closable - Whether the toast can be manually closed
     * @param {Function} options.onClose - Callback when toast is closed
     * @returns {string} Toast ID
     */
    show(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            closable = true,
            onClose = null
        } = options;

        const id = this.generateId();
        const toast = this.createToast(id, type, title, message, closable);
        
        this.toasts.set(id, {
            element: toast,
            duration,
            onClose,
            timeoutId: null
        });

        this.container.appendChild(toast);
        
        // Trigger show animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-dismiss if duration is set
        if (duration > 0) {
            this.setAutoDismiss(id, duration);
        }

        // Announce to screen readers
        this.announceToast(title, message);

        return id;
    }

    createToast(id, type, title, message, closable) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('data-toast-id', id);
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon" aria-hidden="true">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${this.escapeHtml(title)}</div>` : ''}
                ${message ? `<div class="toast-message">${this.escapeHtml(message)}</div>` : ''}
            </div>
            ${closable ? `
                <button class="toast-close" type="button" aria-label="Close notification">
                    ×
                </button>
            ` : ''}
            <div class="toast-progress">
                <div class="toast-progress-bar" style="width: 100%"></div>
            </div>
        `;

        // Add close button event listener
        if (closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.dismiss(id));
        }

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '!',
            warning: '⚠',
            info: 'i'
        };
        return icons[type] || icons.info;
    }

    setAutoDismiss(id, duration) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const progressBar = toastData.element.querySelector('.toast-progress-bar');
        
        // Animate progress bar
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms linear`;
            progressBar.style.width = '0%';
        }

        toastData.timeoutId = setTimeout(() => {
            this.dismiss(id);
        }, duration);
    }

    /**
     * Dismiss a toast notification
     * @param {string} id - Toast ID
     */
    dismiss(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { element, timeoutId, onClose } = toastData;

        // Clear auto-dismiss timer
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Add hide animation
        element.classList.add('hide');
        element.classList.remove('show');

        // Remove from DOM after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.toasts.delete(id);
            
            // Call onClose callback
            if (onClose && typeof onClose === 'function') {
                onClose(id);
            }
        }, 300);
    }

    /**
     * Dismiss all toast notifications
     */
    dismissAll() {
        const ids = Array.from(this.toasts.keys());
        ids.forEach(id => this.dismiss(id));
    }

    /**
     * Update an existing toast
     * @param {string} id - Toast ID
     * @param {Object} options - New options
     */
    update(id, options = {}) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;

        const { title, message, type } = options;
        const { element } = toastData;

        if (type && type !== this.getCurrentType(element)) {
            element.className = `toast ${type} show`;
            const icon = element.querySelector('.toast-icon');
            if (icon) {
                icon.textContent = this.getIcon(type);
            }
        }

        if (title !== undefined) {
            const titleEl = element.querySelector('.toast-title');
            if (titleEl) {
                titleEl.textContent = title;
            } else if (title) {
                const content = element.querySelector('.toast-content');
                const newTitle = document.createElement('div');
                newTitle.className = 'toast-title';
                newTitle.textContent = title;
                content.insertBefore(newTitle, content.firstChild);
            }
        }

        if (message !== undefined) {
            const messageEl = element.querySelector('.toast-message');
            if (messageEl) {
                messageEl.textContent = message;
            } else if (message) {
                const content = element.querySelector('.toast-content');
                const newMessage = document.createElement('div');
                newMessage.className = 'toast-message';
                newMessage.textContent = message;
                content.appendChild(newMessage);
            }
        }
    }

    getCurrentType(element) {
        const classes = element.className.split(' ');
        return classes.find(cls => ['success', 'error', 'warning', 'info'].includes(cls)) || 'info';
    }

    announceToast(title, message) {
        const announcement = [title, message].filter(Boolean).join(': ');
        if (announcement) {
            // Use existing ARIA live region
            const liveRegion = document.getElementById('aria-live-polite');
            if (liveRegion) {
                liveRegion.textContent = announcement;
                // Clear after announcement
                setTimeout(() => {
                    liveRegion.textContent = '';
                }, 1000);
            }
        }
    }

    generateId() {
        return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Convenience methods
     */
    success(title, message, options = {}) {
        return this.show({ ...options, type: 'success', title, message });
    }

    error(title, message, options = {}) {
        return this.show({ ...options, type: 'error', title, message, duration: options.duration || 8000 });
    }

    warning(title, message, options = {}) {
        return this.show({ ...options, type: 'warning', title, message });
    }

    info(title, message, options = {}) {
        return this.show({ ...options, type: 'info', title, message });
    }
}

// Create global instance
window.NotificationToast = new NotificationToast();

// Export for module usage
export default NotificationToast;
