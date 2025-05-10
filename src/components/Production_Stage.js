class ProductionStage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stageIndex = parseInt(this.getAttribute('stage-index') || '0');
    this.initialData = JSON.parse(this.getAttribute('initial-data') || '{}');
    this.isLast = this.getAttribute('is-last') === 'true';
    this.goodsList = ['Flour', 'Sugar', 'Oil'];
    this.rawGoods = this.initialData.rawGoods || [{ name: '', qty: '', dimension: '' }];
    this.outputGoods = this.initialData.outputGoods || [{ name: '', qty: '', dimension: '' }];
    this.middleFields = this.initialData.middleFields || { wastageEntries: [{ good: '', wastage: '', type: 'percent' }], time: '', outsource: 'no' };
    this.modal = { open: false, goodName: '', type: '', idx: -1 };
    this.validationErrors = {};
    this.showErrors = false;
    this.render();
  }

  static get observedAttributes() {
    return ['stage-index', 'initial-data', 'is-last'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'stage-index') this.stageIndex = parseInt(newValue || '0');
    else if (name === 'initial-data') {
      this.initialData = JSON.parse(newValue || '{}');
      this.rawGoods = this.initialData.rawGoods || [{ name: '', qty: '', dimension: '' }];
      this.outputGoods = this.initialData.outputGoods || [{ name: '', qty: '', dimension: '' }];
      this.middleFields = this.initialData.middleFields || { wastageEntries: [{ good: '', wastage: '', type: 'percent' }], time: '', outsource: 'no' };
    }
    else if (name === 'is-last') this.isLast = newValue === 'true';
    this.render();
  }

  validateForm() {
    const errors = {};
    const validateGoods = (goods, type) => {
      const invalidRows = goods
        .map((g, idx) => ({ ...g, idx }))
        .filter(g => !g.name || !g.qty || !g.dimension);
      if (invalidRows.length > 0) {
        errors[`${type}Goods`] = invalidRows.map(row => 
          `Row ${row.idx + 1}: ${!row.name ? 'name' : !row.qty ? 'quantity' : 'dimension'} is required`
        );
      }
    };
    validateGoods(this.rawGoods, 'raw');
    validateGoods(this.outputGoods, 'output');
    const { wastageEntries = [] } = this.middleFields;
    if (wastageEntries.length === 0) {
      errors.wastageEntries = [{ good: 'At least one wastage entry is required' }];
    } else {
      const invalidEntries = wastageEntries
        .map((entry, idx) => ({ ...entry, idx }))
        .filter(entry => !entry.good || !entry.wastage);
      if (invalidEntries.length > 0) {
        errors.wastageEntries = invalidEntries.map(entry => ({
          good: !entry.good ? 'Please select a good' : undefined,
          wastage: !entry.wastage ? 'Please enter wastage amount' : undefined
        }));
      }
    }
    if (!this.middleFields.time) {
      errors.time = 'Please enter production time';
    }
    this.validationErrors = errors;
    return Object.keys(errors).length === 0;
  }

  render() {
    const selectedRawGoods = this.rawGoods.filter(g => g.name).map(g => g.name);
    this.shadowRoot.innerHTML = `
      <style>
        .form {
          margin-bottom: 32px;
          position: relative;
        }
        .container {
          display: flex;
          justify-content: center;
          gap: 32px;
          align-items: flex-start;
          position: relative;
          padding: 32px 0;
          background: #fcfcf7;
          border-radius: 16px;
          border: 1.5px solid #e0d7b6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          flex-wrap: wrap;
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
          overflow: visible;
        }
        .section {
          flex: 1;
          min-width: 260px;
          position: relative;
          z-index: 2;
          word-break: break-word;
          overflow: visible;
        }
        .section.middle {
          min-width: 320px;
        }
        .section h3 {
          text-align: center;
          color: #6b8e23;
          margin-bottom: 16px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .inner-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #fff;
          border-radius: 10px;
          padding: 16px;
          border: 1px solid #e0d7b6;
          min-width: 0;
          overflow: hidden;
        }
        .add-button {
          align-self: flex-start;
          background: #f0f0f0;
          border: 1px dashed #6b8e23;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          color: #6b8e23;
          margin-top: 8px;
        }
        .footer {
          text-align: center;
          margin-top: 32px;
        }
        .error-message {
          color: #d32f2f;
          margin-bottom: 16px;
          padding: 8px;
          background: #ffebee;
          border-radius: 4px;
        }
        .finish-button {
          background: ${this.showErrors && Object.keys(this.validationErrors).length > 0 ? '#b5b5b5' : '#6b8e23'};
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 32px;
          font-size: 1.1rem;
          cursor: ${this.showErrors && Object.keys(this.validationErrors).length > 0 ? 'not-allowed' : 'pointer'};
          transition: all 0.2s ease;
        }
      </style>
      <form class="form">
        <div class="container">
          <!-- Raw/Intermediate Goods -->
          <div class="section">
            <h3>Raw/Intermediate Goods</h3>
            <div class="inner-section">
              ${this.rawGoods.map((row, idx) => `
                <goods-input-row
                  goods-list='${JSON.stringify(this.goodsList)}'
                  value='${JSON.stringify(row)}'
                  allow-remove="${this.rawGoods.length > 1}"
                  show-dimension="true"
                  error="${this.showErrors && this.validationErrors.rawGoods?.find(err => err.startsWith(`Row ${idx + 1}:`)) || ''}"
                  data-idx="${idx}"
                  data-type="raw"
                ></goods-input-row>
              `).join('')}
              <button type="button" class="add-button" id="add-raw">+ Add Raw Good</button>
            </div>
          </div>
          <!-- Production Details -->
          <div class="section middle">
            <h3>Production Details</h3>
            <div class="inner-section">
              <wastage-fields
                value='${JSON.stringify(this.middleFields)}'
                wastage-goods='${JSON.stringify(selectedRawGoods)}'
                errors='${JSON.stringify(this.showErrors ? this.validationErrors : {})}'
              ></wastage-fields>
            </div>
          </div>
          <!-- Output Goods -->
          <div class="section">
            <h3>Output Goods</h3>
            <div class="inner-section">
              ${this.outputGoods.map((row, idx) => `
                <goods-input-row
                  goods-list='${JSON.stringify(this.goodsList)}'
                  value='${JSON.stringify(row)}'
                  allow-remove="${this.outputGoods.length > 1}"
                  show-dimension="true"
                  error="${this.showErrors && this.validationErrors.outputGoods?.find(err => err.startsWith(`Row ${idx + 1}:`)) || ''}"
                  data-idx="${idx}"
                  data-type="output"
                ></goods-input-row>
              `).join('')}
              <button type="button" class="add-button" id="add-output">+ Add Output Good</button>
            </div>
          </div>
        </div>
        ${this.isLast ? `
          <div class="footer">
            ${this.showErrors && Object.keys(this.validationErrors).length > 0 ? `
              <div class="error-message">Please fix the validation errors before proceeding</div>
            ` : ''}
            <button type="submit" class="finish-button">Finish</button>
          </div>
        ` : ''}
        <confirmation-modal
          open="${this.modal.open}"
          good-name="${this.modal.goodName}"
        ></confirmation-modal>
      </form>
    `;

    this.shadowRoot.querySelectorAll('goods-input-row').forEach(row => {
      row.addEventListener('change', (e) => {
        const idx = parseInt(row.dataset.idx);
        const type = row.dataset.type;
        if (type === 'raw') {
          this.rawGoods[idx] = e.detail.value;
        } else {
          this.outputGoods[idx] = e.detail.value;
        }
        this.render();
      });
      row.addEventListener('remove', () => {
        const idx = parseInt(row.dataset.idx);
        const type = row.dataset.type;
        if (type === 'raw') {
          this.rawGoods = this.rawGoods.filter((_, i) => i !== idx);
        } else {
          this.outputGoods = this.outputGoods.filter((_, i) => i !== idx);
        }
        this.render();
      });
      row.addEventListener('add-new', () => {
        const idx = parseInt(row.dataset.idx);
        const type = row.dataset.type;
        let name = type === 'raw' ? this.rawGoods[idx].name : this.outputGoods[idx].name;
        this.modal = { open: true, goodName: name, type, idx };
        this.render();
      });
    });

    this.shadowRoot.querySelector('wastage-fields').addEventListener('change', (e) => {
      this.middleFields = e.detail.value;
      this.render();
    });

    this.shadowRoot.querySelector('confirmation-modal').addEventListener('confirm', (e) => {
      const { type, idx } = this.modal;
      const newName = e.detail.value;
      this.goodsList = [...this.goodsList, newName];
      if (type === 'raw') {
        this.rawGoods[idx] = { ...this.rawGoods[idx], name: newName };
      } else {
        this.outputGoods[idx] = { ...this.outputGoods[idx], name: newName };
      }
      this.modal = { open: false, goodName: '', type: '', idx: -1 };
      this.render();
    });

    this.shadowRoot.querySelector('confirmation-modal').addEventListener('cancel', () => {
      this.modal = { open: false, goodName: '', type: '', idx: -1 };
      this.render();
    });

    this.shadowRoot.querySelector('#add-raw').addEventListener('click', () => {
      this.rawGoods = [...this.rawGoods, { name: '', qty: '', dimension: '' }];
      this.render();
    });

    this.shadowRoot.querySelector('#add-output').addEventListener('click', () => {
      this.outputGoods = [...this.outputGoods, { name: '', qty: '', dimension: '' }];
      this.render();
    });

    this.shadowRoot.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.showErrors = true;
      const isValid = this.validateForm();
      if (isValid) {
        this.dispatchEvent(new CustomEvent('complete', {
          detail: { rawGoods: this.rawGoods, outputGoods: this.outputGoods, middleFields: this.middleFields },
          bubbles: true,
          composed: true
        }));
      }
      this.render();
    });
  }
}

customElements.define('production-stage', ProductionStage);