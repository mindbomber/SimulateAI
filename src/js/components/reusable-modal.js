// Add timing constant
const CLOSE_ANIMATION_DELAY = 200;

// Reusable Modal/Dialog Component
// Usage: const modal = new ReusableModal({ title, content, footer, onClose }); modal.open();

import focusManager from '../utils/focus-manager.js';

class ReusableModal {
  constructor({
    title = '',
    content = '',
    footer = '',
    onClose = null,
    closeOnBackdrop = true,
    closeOnEscape = true,
  } = {}) {
    this.title = title;
    this.content = content;
    this.footer = footer;
    this.onClose = onClose;
    this.closeOnBackdrop = closeOnBackdrop;
    this.closeOnEscape = closeOnEscape;
    this.isOpen = false;
    this._build();
  }

  _build() {
    // Backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'reusable-modal-backdrop';
    this.backdrop.tabIndex = -1;
    this.backdrop.addEventListener('click', e => {
      if (e.target === this.backdrop && this.closeOnBackdrop) {
        this.close();
      }
    });

    // Modal
    this.modal = document.createElement('div');
    this.modal.className = 'reusable-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('tabindex', '-1');

    // Header
    this.header = document.createElement('div');
    this.header.className = 'reusable-modal-header';
    this.titleEl = document.createElement('div');
    this.titleEl.className = 'reusable-modal-title';
    this.titleEl.textContent = this.title;
    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'reusable-modal-close';
    this.closeBtn.setAttribute('aria-label', 'Close dialog');
    this.closeBtn.innerHTML = '&times;';
    this.closeBtn.addEventListener('click', () => this.close());
    this.header.appendChild(this.titleEl);
    this.header.appendChild(this.closeBtn);

    // Body
    this.body = document.createElement('div');
    this.body.className = 'reusable-modal-body';
    if (typeof this.content === 'string') {
      this.body.innerHTML = this.content;
    } else if (this.content instanceof Node) {
      this.body.appendChild(this.content);
    }

    // Footer
    this.footerEl = document.createElement('div');
    this.footerEl.className = 'reusable-modal-footer';
    if (typeof this.footer === 'string') {
      this.footerEl.innerHTML = this.footer;
    } else if (this.footer instanceof Node) {
      this.footerEl.appendChild(this.footer);
    }

    // Assemble
    this.modal.appendChild(this.header);
    this.modal.appendChild(this.body);
    this.modal.appendChild(this.footerEl);
  }

  open() {
    if (this.isOpen) return;
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);
    setTimeout(() => {
      this.backdrop.classList.add('show');
      this.modal.classList.add('show');
      this.modal.focus();
    }, 10);

    // Create focus trap using centralized manager
    this.focusTrap = focusManager.createTrap(this.modal, {
      autoFocus: true,
      restoreFocus: true,
    });

    if (this.closeOnEscape) {
      this._escHandler = e => {
        if (e.key === 'Escape') this.close();
      };
      document.addEventListener('keydown', this._escHandler);
    }
    this.isOpen = true;
  }

  close() {
    if (!this.isOpen) return;

    // Clean up focus trap
    if (this.focusTrap) {
      this.focusTrap.destroy();
      this.focusTrap = null;
    }

    this.backdrop.classList.remove('show');
    this.modal.classList.remove('show');
    setTimeout(() => {
      if (this.backdrop.parentNode)
        this.backdrop.parentNode.removeChild(this.backdrop);
      if (this.modal.parentNode) this.modal.parentNode.removeChild(this.modal);
      if (typeof this.onClose === 'function') this.onClose();
    }, CLOSE_ANIMATION_DELAY);
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    this.isOpen = false;
  }

  setTitle(title) {
    this.title = title;
    this.titleEl.textContent = title;
  }

  setContent(content) {
    this.content = content;
    this.body.innerHTML = '';
    if (typeof content === 'string') {
      this.body.innerHTML = content;
    } else if (content instanceof Node) {
      this.body.appendChild(content);
    }
  }

  setFooter(footer) {
    this.footer = footer;
    this.footerEl.innerHTML = '';
    if (typeof footer === 'string') {
      this.footerEl.innerHTML = footer;
    } else if (footer instanceof Node) {
      this.footerEl.appendChild(footer);
    }
  }

  _trapFocus() {
    // Focus trap is now handled by the centralized focus manager
    // This method is kept for backward compatibility but does nothing
    // Focus trap is set up in the open() method using focusManager.createTrap()
  }
}

// Make available globally
window.ReusableModal = ReusableModal;
export default ReusableModal;
