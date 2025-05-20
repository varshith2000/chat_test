class ProductionStage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stageIndex = parseInt(this.getAttribute('stage-index') || '0');
    this.stageCount = parseInt(this.getAttribute('stage-count') || '1');
    this.initialData = JSON.parse(this.getAttribute('initial-data') || '{}');
    console.log('ProductionStage initialized with initial-data:', this.initialData);
    this.goodsList = JSON.parse(this.getAttribute('goods-list') || '[]');
    this.rawGoods = this.initialData.rawGoods || [{ name: '', qty: '', dimension: '' }];
    this.outputGoods = this.initialData.outputGoods || [{ name: '', qty: '', dimension: '' }];
    this.middleFields = this.initialData.middleFields || {
      wastageEntries: [{ good: '', wastage: '', type: 'percent' }],
      time: '',
      outsource: 'no'
    };
    this.modal = { open: false, goodName: '', type: '', idx: -1 };
    this.validationErrors = {};
    this.showErrors = false;
    this.render();
  }

  static get observedAttributes() {
    return ['stage-index', 'initial-data', 'stage-count', 'goods-list'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'stage-index') {
      this.stageIndex = parseInt(newValue || '0');
    } else if (name === 'stage-count') {
      this.stageCount = parseInt(newValue || '1');
    } else if (name === 'goods-list') {
      try {
        this.goodsList = JSON.parse(newValue || '[]');
        console.log('Updated goods-list:', this.goodsList);
        this.render();
      } catch (error) {
        console.error('Error parsing goods-list:', error);
      }
    } else if (name === 'initial-data') {
      try {
        this.initialData = JSON.parse(JSON.stringify(JSON.parse(newValue || '{}')));
        console.log('ProductionStage updated with initial-data:', this.initialData);
        this.rawGoods = this.initialData.rawGoods || [{ name: '', qty: '', dimension: '' }];
        this.outputGoods = this.initialData.outputGoods || [{ name: '', qty: '', dimension: '' }];
        this.middleFields = this.initialData.middleFields || {
          wastageEntries: [{ good: '', wastage: '', type: 'percent' }],
          time: '',
          outsource: 'no'
        };
        this.render();
      } catch (error) {
        console.error('Error parsing initial-data:', error);
        this.initialData = {};
        this.rawGoods = [{ name: '', qty: '', dimension: '' }];
        this.outputGoods = [{ name: '', qty: '', dimension: '' }];
        this.middleFields = { wastageEntries: [{ good: '', wastage: '', type: 'percent' }], time: '', outsource: 'no' };
        this.render();
      }
    }
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

  updateGoodsList(newGood) {
    if (!this.goodsList.includes(newGood)) {
      this.goodsList = [...this.goodsList, newGood];
      this.dispatchEvent(new CustomEvent('goods-list-update', {
        detail: { goodsList: this.goodsList },
        bubbles: true,
        composed: true
      }));
    }
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
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #88bfe8;
          box-shadow: 0 2px 8px rgba(136,191,232,0.08);
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
          color: #340368;
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
          border: 1px solid #88bfe8;
          min-width: 0;
          overflow: hidden;
        }
        .add-button {
          align-self: flex-start;
          background: #ffffff;
          border: 1px dashed #88bfe8;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          color: #340368;
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
          background: #88bfe8;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 32px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .finish-button:disabled {
          background: #b5b5b5;
          cursor: not-allowed;
        }
        .nav-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
        }
        .nav-button {
          background: #88bfe8;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-button.prev {
          background: #f0f0f0;
          color: #340368;
        }
        .nav-button:disabled {
          background: #b5b5b5;
          cursor: not-allowed;
        }
        .stage-header {
          text-align: center;
          margin-bottom: 24px;
        }
      </style>
      <form class="form">
        <div class="container">
          <div class="stage-header">
            <h3>Stage ${this.stageIndex + 1} of ${this.stageCount}</h3>
          </div>
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
        <div class="footer">
          <div class="nav-buttons">
          ${this.stageIndex > 0 ? `
            <button type="button" class="nav-button prev" id="prev-stage">
              ← Previous Stage
            </button>
          ` : ''}
          
          ${this.stageIndex === this.stageCount - 1 ? `
            ${this.showErrors && Object.keys(this.validationErrors).length > 0 ? `
              <div class="error-message">Please fix the validation errors before proceeding</div>
            ` : ''}
            <button 
              type="submit" 
              class="nav-button next"
              ${this.showErrors && Object.keys(this.validationErrors).length > 0 ? 'disabled' : ''}
            >
              Finish and Show Summary
            </button>
          ` : `
            <button 
              type="submit" 
              class="nav-button next"
              ${this.showErrors && Object.keys(this.validationErrors).length > 0 ? 'disabled' : ''}
            >
              Save and Next Stage →
            </button>
          `}
        </div>
        </div>
        <confirmation-modal
          open="${this.modal.open}"
          good-name="${this.modal.goodName}"
        ></confirmation-modal>
      </form>
    `;

    this.shadowRoot.querySelectorAll('goods-input-row').forEach(row => {
      row.addEventListener('input', () => {
        this.showErrors = false;
        this.validationErrors = {};
        this.render();
      });
      row.addEventListener('change', (e) => {
        const idx = parseInt(row.dataset.idx);
        const type = row.dataset.type;
        const value = e.detail.value;
        console.log(`goods-input-row changed for ${type} at index ${idx}:`, value);
        if (type === 'raw') {
          this.rawGoods[idx] = value;
        } else {
          this.outputGoods[idx] = value;
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
      const value = e.detail.value;
      console.log('wastage-fields changed:', value);
      this.middleFields = value;
      this.render();
    });

    this.shadowRoot.querySelector('confirmation-modal').addEventListener('confirm', (e) => {
      const { type, idx } = this.modal;
      const newName = e.detail.value;
      this.updateGoodsList(newName);
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
        this.showErrors = false;
        const stageData = {
          rawGoods: this.rawGoods.map(good => ({
            name: good.name || '',
            qty: good.qty || '',
            dimension: good.dimension || ''
          })),
          middleFields: {
            wastageEntries: this.middleFields.wastageEntries.map(entry => ({
              good: entry.good || '',
              wastage: entry.wastage || '',
              type: entry.type || 'percent'
            })),
            time: this.middleFields.time || '',
            outsource: this.middleFields.outsource || 'no'
          },
          outputGoods: this.outputGoods.map(good => ({
            name: good.name || '',
            qty: good.qty || '',
            dimension: good.dimension || ''
          }))
        };
        console.log(`Submitting stage ${this.stageIndex + 1} with data:`, stageData);
        this.dispatchEvent(new CustomEvent('complete', {
          detail: stageData,
          bubbles: true,
          composed: true
        }));
      } else {
        console.log('Validation errors:', this.validationErrors);
      }
      this.render();
    });

    const prevButton = this.shadowRoot.querySelector('#prev-stage');
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        const stageData = {
          rawGoods: this.rawGoods,
          outputGoods: this.outputGoods,
          middleFields: this.middleFields
        };
        console.log(`Navigating to previous stage from ${this.stageIndex + 1} with data:`, stageData);
        this.dispatchEvent(new CustomEvent('prev-stage', {
          detail: { stageIndex: this.stageIndex, stageData },
          bubbles: true,
          composed: true
        }));
      });
    }
  }
}

customElements.define('production-stage', ProductionStage);