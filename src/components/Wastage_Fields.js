class WastageFields extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.value = JSON.parse(this.getAttribute('value') || '{"wastageEntries":[{"good":"","wastage":"","type":"percent"}],"time":"","outsource":"no"}');
    this.wastageGoods = JSON.parse(this.getAttribute('wastage-goods') || '[]');
    this.errors = JSON.parse(this.getAttribute('errors') || '{}');
    this.render();
  }

  static get observedAttributes() {
    return ['value', 'wastage-goods', 'errors'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') this.value = JSON.parse(newValue || '{"wastageEntries":[{"good":"","wastage":"","type":"percent"}],"time":"","outsource":"no"}');
    else if (name === 'wastage-goods') this.wastageGoods = JSON.parse(newValue || '[]');
    else if (name === 'errors') this.errors = JSON.parse(newValue || '{}');
    this.render();
  }

  handleWastageChange(index, field, newValue) {
    const newEntries = [...this.value.wastageEntries];
    newEntries[index] = { ...newEntries[index], [field]: newValue };
    this.value.wastageEntries = newEntries;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.render();
  }

  addWastageEntry() {
    const newEntries = [...this.value.wastageEntries, { good: '', wastage: '', type: 'percent' }];
    this.value.wastageEntries = newEntries;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.render();
  }

  removeWastageEntry(index) {
    const newEntries = this.value.wastageEntries.filter((_, i) => i !== index);
    this.value.wastageEntries = newEntries;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
    this.render();
  }

  render() {
    const wastageEntries = this.value.wastageEntries || [{ good: '', wastage: '', type: 'percent' }];
    this.shadowRoot.innerHTML = `
      <style>
        .middle-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
        }
        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .label {
          font-size: 1rem;
          color: #6b8e23;
          font-family: 'Caveat', cursive;
        }
        .input, .select {
          flex: 1;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #e0d7b6;
          font-size: 1rem;
        }
        .input:focus, .select:focus {
          outline: none;
          border-color: #6b8e23;
        }
        .input.has-error, .select.has-error {
          border-color: #d32f2f;
        }
        .button {
          background: #f7c873;
          color: #6b8e23;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 1rem;
          cursor: pointer;
        }
        .button:hover {
          background: #ffe2a9;
        }
        .error-text {
          color: #d32f2f;
          font-size: 0.75rem;
          padding-left: 4px;
        }
        .wastage-entry {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          border: 1px solid #e0d7b6;
          border-radius: 8px;
          margin-bottom: 12px;
          position: relative;
        }
        .remove-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #d32f2f;
          color: white;
          border: none;
          border-radius: 4px;
          width: 24px;
          height: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .remove-button:hover {
          background: #b71c1c;
        }
      </style>
      <div class="middle-container">
        <div class="field">
          <label class="label">Wastage Entries</label>
          ${wastageEntries.map((entry, index) => `
            <div class="wastage-entry">
              ${wastageEntries.length > 1 ? `<button class="remove-button" data-index="${index}">×</button>` : ''}
              <div class="input-row">
                <select class="select ${this.errors.wastageEntries?.[index]?.good ? 'has-error' : ''}" data-index="${index}" data-field="good" style="flex: 2;">
                  <option value="">Select a good...</option>
                  ${this.wastageGoods.map(good => `<option value="${good}" ${entry.good === good ? 'selected' : ''}>${good}</option>`).join('')}
                </select>
              </div>
              <div class="input-row">
                <input
                  type="number"
                  min="0"
                  class="input ${this.errors.wastageEntries?.[index]?.wastage ? 'has-error' : ''}"
                  value="${entry.wastage || ''}"
                  placeholder="Wastage"
                  data-index="${index}"
                  data-field="wastage"
                />
                <select class="select" data-index="${index}" data-field="type" style="width: 100px;">
                  <option value="percent" ${entry.type === 'percent' ? 'selected' : ''}>%</option>
                  <option value="value" ${entry.type === 'value' ? 'selected' : ''}>Value</option>
                </select>
              </div>
              ${this.errors.wastageEntries?.[index]?.good ? `<div class="error-text">${this.errors.wastageEntries[index].good}</div>` : ''}
              ${this.errors.wastageEntries?.[index]?.wastage ? `<div class="error-text">${this.errors.wastageEntries[index].wastage}</div>` : ''}
            </div>
          `).join('')}
          <button class="button" id="add-wastage">+ Add Wastage Entry</button>
        </div>
        <div class="field">
          <label class="label">Production Time</label>
          <div class="input-row">
            <input
              type="text"
              class="input ${this.errors.time ? 'has-error' : ''}"
              value="${this.value.time || ''}"
              placeholder="e.g. 2h 30m"
              id="time"
            />
          </div>
          ${this.errors.time ? `<div class="error-text">${this.errors.time}</div>` : ''}
        </div>
        <div class="field">
          <label class="label">Outsource?</label>
          <div class="input-row">
            <select class="select" id="outsource">
              <option value="no" ${this.value.outsource === 'no' ? 'selected' : ''}>No</option>
              <option value="yes" ${this.value.outsource === 'yes' ? 'selected' : ''}>Yes</option>
            </select>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('select[data-field="good"]').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.handleWastageChange(index, 'good', e.target.value);
      });
    });

    this.shadowRoot.querySelectorAll('input[data-field="wastage"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.handleWastageChange(index, 'wastage', e.target.value);
      });
    });

    this.shadowRoot.querySelectorAll('select[data-field="type"]').forEach(select => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.handleWastageChange(index, 'type', e.target.value);
      });
    });

    this.shadowRoot.querySelectorAll('.remove-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeWastageEntry(index);
      });
    });

    this.shadowRoot.querySelector('#add-wastage').addEventListener('click', () => this.addWastageEntry());

    this.shadowRoot.querySelector('#time').addEventListener('input', (e) => {
      this.value.time = e.target.value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }));
    });

    this.shadowRoot.querySelector('#outsource').addEventListener('change', (e) => {
      this.value.outsource = e.target.value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('wastage-fields', WastageFields);