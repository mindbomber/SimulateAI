// Reusable Card Component
// Usage: CardComponent.create({ header, content, actions })

class CardComponent {
  /**
   * Create a card element
   * @param {Object} options
   * @param {string|Node} options.header - Card header/title
   * @param {string|Node} options.content - Card content/body
   * @param {Array<{label: string, onClick: function, className?: string}>} [options.actions] - Action buttons
   * @returns {HTMLElement}
   */
  static create({ header = '', content = '', actions = [] } = {}) {
    const card = document.createElement('div');
    card.className = 'card';
    card.tabIndex = 0;

    // Header
    if (header) {
      const headerEl = document.createElement('div');
      headerEl.className = 'card-header';
      if (typeof header === 'string') {
        headerEl.textContent = header;
      } else {
        headerEl.appendChild(header);
      }
      card.appendChild(headerEl);
    }

    // Content
    if (content) {
      const contentEl = document.createElement('div');
      contentEl.className = 'card-content';
      if (typeof content === 'string') {
        contentEl.textContent = content;
      } else {
        contentEl.appendChild(content);
      }
      card.appendChild(contentEl);
    }

    // Actions
    if (actions && actions.length) {
      const actionsEl = document.createElement('div');
      actionsEl.className = 'card-actions';
      actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = `card-action-btn${action.className ? ` ${action.className}` : ''}`;
        btn.type = 'button';
        btn.textContent = action.label;
        btn.addEventListener('click', action.onClick);
        actionsEl.appendChild(btn);
      });
      card.appendChild(actionsEl);
    }

    return card;
  }
}

window.CardComponent = CardComponent;
export default CardComponent;
