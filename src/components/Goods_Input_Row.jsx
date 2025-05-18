class GoodsInputRow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.goodsList = JSON.parse(this.getAttribute('goods-list') || '[]');
    this.value = JSON.parse(this.getAttribute('value') || '{"name":"","qty":"","dimension":""}');
    this.allowRemove = this.getAttribute('allow-remove') === 'true';
    this.showDimension = this.getAttribute('show-dimension') === 'true';
    this.placeholder = this.getAttribute('placeholder') || 'Select good...';
    this.error = this.getAttribute('error') || '';
    this.render();
  }

  static get observedAttributes() {
    return ['goods-list', 'value', 'allow-remove', 'show-dimension', 'placeholder', 'error'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'goods-list') this.goodsList = JSON.parse(newValue || '[]');
    else if (name === 'value') this.value = JSON.parse(newValue || '{"name":"","qty":"","dimension":""}');
    else if (name === 'allow-remove') this.allowRemove = newValue === 'true';
    else if (name === 'show-dimension') this.showDimension = newValue === 'true';
    else if (name === 'placeholder') this.placeholder = newValue || 'Select good...';
    else if (name === 'error') this.error = newValue || '';
    this.render();
  }

  render() {
    const hasError = Boolean(this.error);
    this.shadowRoot.innerHTML = `
      <style>
        .row {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }
        .input-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .select, .input, .dimension-select {
          border: 1px solid #88bfe8; /* Light blue border */
        }
        .select:focus, .input:focus, .dimension-select:focus {
          border-color: #340368; /* Dark purple */
        }
        .add-button {
          background: #ffffff; /* White background */
          border: 1px dashed #88bfe8; /* Light blue border */
          color: #340368; /* Dark purple */
        }
        .input-row {
          border-color: #88bfe8; /* Light blue border */
        }
        .button {
          background-color: #88bfe8; /* Light blue */
          color: #ffffff; /* White text */
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #340368;
          color: #fff;
        }
      </style>
      <div class="row">
        <div class="input-row">
          <div class="select-container">
            <select class="select">
              <option value="" disabled>${this.placeholder}</option>
              ${this.goodsList.map(g => `<option value="${g}">${g}</option>`).join('')}
              <option value="__add_new__">+ Add new...</option>
            </select>
          </div>
          <div class="input-container">
            <input type="text" inputmode="numeric" pattern="[0-9]*" class="input" min="0" value="${this.value.qty || ''}" placeholder="Qty" />
          </div>
          ${this.showDimension ? `
            <div class="dimension-container">
              <select class="dimension-select">
                <option value="">Unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">L</option>
                <option value="pcs">pcs</option>
                <option value="units">units</option>
              </select>
            </div>
          ` : ''}
          ${this.allowRemove ? `<button class="button" id="remove">-</button>` : ''}
        </div>
        ${this.error ? `<div class="error-text">${this.error}</div>` : ''}
      </div>
    `;

    const select = this.shadowRoot.querySelector('.select');
    select.value = this.value.name || '';
    select.addEventListener('input', (e) => {
      const selected = e.target.value;
      if (selected === '__add_new__') {
        this.dispatchEvent(new CustomEvent('add-new', {
          bubbles: true,
          composed: true
        }));
      } else {
        this.value.name = selected;
        // Dispatch both 'input' and 'change' for React compatibility and validation clearing
        this.dispatchEvent(new CustomEvent('input', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }));
        this.dispatchEvent(new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }));
      }
    });

    // Also support 'change' event for select for compatibility
    select.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected === '__add_new__') {
        this.dispatchEvent(new CustomEvent('add-new', {
          bubbles: true,
          composed: true
        }));
      } else {
        this.value.name = selected;
        this.dispatchEvent(new CustomEvent('input', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }));
        this.dispatchEvent(new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }));
      }
    });

    const qtyInput = this.shadowRoot.querySelector('.input');
    qtyInput.value = this.value.qty || '';
    // Handle input changes for quantity
    qtyInput.addEventListener('input', (e) => {
      const newValue = e.target.value.replace(/[^0-9]/g, '');
      this.value.qty = newValue;
      e.target.value = newValue;
      // Dispatch both 'input' and 'change' events for React compatibility and validation clearing
      this.dispatchEvent(new CustomEvent('input', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }));
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }));
    });

    // Maintain focus on the input field
    qtyInput.addEventListener('focus', function() {
      const val = this.value;
      this.value = '';
      this.value = val;
    });

    // Add support for text input for name field (if you want to allow typing a new name)
    // If you have a text input for name, use the same pattern:
    // nameInput.addEventListener('input', (e) => {
    //   this.value.name = e.target.value;
    //   this.dispatchEvent(new CustomEvent('input', { detail: { value: this.value }, bubbles: true, composed: true }));
    //   this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value }, bubbles: true, composed: true }));
    // });

    if (this.showDimension) {
      const dimensionSelect = this.shadowRoot.querySelector('.dimension-select');
      dimensionSelect.value = this.value.dimension || '';
      dimensionSelect.addEventListener('change', (e) => {
        this.value.dimension = e.target.value;
        this.dispatchEvent(new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }));
      });
    }

    if (this.allowRemove) {
      this.shadowRoot.querySelector('#remove').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('remove', {
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  // Removed submit workflow button as it's now handled in the chat component
}

customElements.define('goods-input-row', GoodsInputRow);