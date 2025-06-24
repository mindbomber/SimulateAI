// Loader/Spinner Web Component
class LoaderSpinner extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'centered', 'hidden'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const wrapper = document.createElement('span');
    wrapper.className = 'loader-spinner';
    if (this.hasAttribute('centered')) wrapper.classList.add('centered');
    if (this.hasAttribute('hidden')) wrapper.setAttribute('hidden', '');
    shadow.appendChild(wrapper);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'src/styles/loader-spinner.css';
    shadow.appendChild(link);
    this._spinner = wrapper;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'size') {
      const size = newValue || '48px';
      this._spinner.style.width = size;
      this._spinner.style.height = size;
    }
    if (name === 'centered') {
      this._spinner.classList.toggle('centered', this.hasAttribute('centered'));
    }
    if (name === 'hidden') {
      if (this.hasAttribute('hidden')) {
        this._spinner.setAttribute('hidden', '');
      } else {
        this._spinner.removeAttribute('hidden');
      }
    }
  }
}

customElements.define('loader-spinner', LoaderSpinner);
