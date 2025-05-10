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
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid ${hasError ? '#d32f2f' : '#e0d7b6'};
          font-size: 1rem;
        }
        .select:focus, .input:focus, .dimension-select:focus {
          outline: none;
          border-color: ${hasError ? '#d32f2f' : '#6b8e23'};
        }
        .select, .dimension-select {
          flex: 2;
          margin-right: 10px;
        }
        .input {
          flex: 1;
          margin-right: 10px;
        }
        .select-container, .input-container, .dimension-container {
          min-width: 140px;
        }
        .input-container, .dimension-container {
          min-width: 80px;
        }
        .select-container select, .input-container input, .dimension-container select {
          width: 100%;
        }
        .button {
          background: #f7c873;
          color: #6b8e23;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 1rem;
          cursor: pointer;
          margin-left: 4px;
        }
        .button:hover {
          background: #ffe2a9;
        }
        .error-text {
          color: #d32f2f;
          font-size: 0.75rem;
          margin-top: 4px;
          padding-left: 4px;
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
            <input type="number" class="input" min="0" value="${this.value.qty || ''}" placeholder="Qty" />
          </div>
          ${this.showDimension ? `
            <div class="dimension-container">
              <select class="dimension-select">
                <option value="">Unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">L</option>
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
    select.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected === '__add_new__') {
        this.dispatchEvent(new CustomEvent('add-new', {
          bubbles: true,
          composed: true
        }));
      } else {
        this.value.name = selected;
        this.dispatchEvent(new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true
        }));
      }
    });

    const qtyInput = this.shadowRoot.querySelector('.input');
    qtyInput.addEventListener('input', (e) => {
      this.value.qty = e.target.value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }));
    });

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
}

customElements.define('goods-input-row', GoodsInputRow);