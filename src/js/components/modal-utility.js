/**
 * Simple Modal Utility using advanced-ui-components.css modal system
 * Replacement for ReusableModal to consolidate modal implementations
 */

class ModalUtility {
    constructor({ 
        title = '', 
        content = '', 
        footer = '', 
        onClose = null, 
        closeOnBackdrop = true, 
        closeOnEscape = true 
    } = {}) {
        this.title = title;
        this.content = content;
        this.footer = footer;
        this.onClose = onClose;
        this.closeOnBackdrop = closeOnBackdrop;
        this.closeOnEscape = closeOnEscape;
        this.isOpen = false;
        this.element = null;
        this.id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this._build();
        this._setupEventListeners();
    }

    _build() {
        // Create modal structure using advanced-ui-components.css classes
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'modal-backdrop';
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');
        this.element.setAttribute('aria-hidden', 'true');
        this.element.setAttribute('aria-labelledby', `${this.id}-title`);
        this.element.style.display = 'none';

        this.element.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h2 id="${this.id}-title" class="modal-title">${this.title}</h2>
                    <button class="modal-close" aria-label="Close modal" type="button">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
                ${this.footer ? `
                    <div class="modal-footer">
                        ${this.footer}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(this.element);
    }

    _setupEventListeners() {
        // Close button
        const closeBtn = this.element.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Backdrop click
        if (this.closeOnBackdrop) {
            this.element.addEventListener('click', (e) => {
                if (e.target === this.element) {
                    this.close();
                }
            });
        }

        // Escape key
        if (this.closeOnEscape) {
            this._escapeHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this._escapeHandler);
        }
    }

    open() {
        if (this.isOpen) return;

        this.isOpen = true;
        this.element.style.display = 'flex';
        this.element.setAttribute('aria-hidden', 'false');
        
        // Add visible class for CSS animation and opacity
        requestAnimationFrame(() => {
            this.element.classList.add('visible');
        });
        
        // Focus management
        requestAnimationFrame(() => {
            const firstFocusable = this.element.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
                firstFocusable.focus();
            }
        });

        // Add body class to prevent scrolling
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        this.element.style.display = 'none';
        this.element.setAttribute('aria-hidden', 'true');
        
        // Restore body scrolling
        document.body.style.overflow = '';

        // Call onClose callback if provided
        if (this.onClose && typeof this.onClose === 'function') {
            this.onClose();
        }
    }

    destroy() {
        this.close();
        
        if (this._escapeHandler) {
            document.removeEventListener('keydown', this._escapeHandler);
        }
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.element = null;
    }

    // Update content methods
    setTitle(title) {
        this.title = title;
        const titleEl = this.element.querySelector('.modal-title');
        if (titleEl) {
            titleEl.textContent = title;
        }
    }

    setContent(content) {
        this.content = content;
        const bodyEl = this.element.querySelector('.modal-body');
        if (bodyEl) {
            bodyEl.innerHTML = content;
        }
    }

    setFooter(footer) {
        this.footer = footer;
        let footerEl = this.element.querySelector('.modal-footer');
        
        if (footer) {
            if (!footerEl) {
                footerEl = document.createElement('div');
                footerEl.className = 'modal-footer';
                this.element.querySelector('.modal-dialog').appendChild(footerEl);
            }
            footerEl.innerHTML = footer;
        } else if (footerEl) {
            footerEl.remove();
        }
    }
}

// Export for both ES6 and global usage
export default ModalUtility;

// Make available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.ModalUtility = ModalUtility;
    // TEMPORARILY COMMENTED OUT - might be causing conflicts
    // Also provide as ReusableModal for drop-in replacement
    // window.ReusableModal = ModalUtility;
}
