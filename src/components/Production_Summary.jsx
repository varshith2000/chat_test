class ProductionSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stages = [];
    this.initializeData();
    this.render();
  }

  initializeData() {
    try {
      const stagesAttr = this.getAttribute('stages');
      const dataAttr = this.getAttribute('data');
      console.log('Raw attributes:', { stagesAttr, dataAttr });
      
      if (dataAttr) {
        const parsedData = JSON.parse(dataAttr);
        console.log('Parsed data:', parsedData);
        if (parsedData.productionStages) {
          this.stages = parsedData.productionStages;
        }
      } else if (stagesAttr) {
        const parsedStages = JSON.parse(stagesAttr);
        if (parsedStages.productionStages) {
          this.stages = parsedStages.productionStages;
        } else if (Array.isArray(parsedStages)) {
          this.stages = parsedStages;
        }
      }
      console.log('Initialized stages:', this.stages);
    } catch (error) {
      console.error('Error initializing data:', error);
      this.stages = [];
    }
  }

  static get observedAttributes() {
    return ['stages', 'data', 'showedit', 'showsubmit'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data' || name === 'stages') {
      console.log(`Attribute ${name} changed:`, { oldValue, newValue });
      this.initializeData();
      this.render();
    }
  }

  render() {
    const showEdit = this.getAttribute('showedit') !== 'false';
    const showSubmit = this.getAttribute('showsubmit') !== 'false';
    // Prioritize this.data.productionStages over this.stages to avoid rendering issues
    const summaryData = (this.data && this.data.productionStages && Array.isArray(this.data.productionStages)) 
      ? this.data.productionStages 
      : (this.stages && Array.isArray(this.stages)) 
        ? this.stages 
        : [];
    console.log('Rendering summary with final summaryData:', summaryData);

    this.shadowRoot.innerHTML = `
      <style>
        .summary-container {
          margin: 32px auto;
          max-width: 1400px;
        }
        .header {
          background: #ffffff;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 2px 8px rgba(52,3,104,0.08);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1.5px solid #88bfe8;
          border-bottom: none;
        }
        .header h2 {
          color: #340368;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        .button {
          background: #e3f0fa;
          color: #340368;
          border: 1px solid #88bfe8;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .button:hover {
          background: #cbe3f7;
          color: #340368;
          border-color: #340368;
        }
        .button.primary {
          background: #340368;
          color: #fff;
          border: none;
        }
        .button.primary:hover {
          background: #4b0c8a;
          color: #fff;
        }
        .stage-detail {
          margin-bottom: 32px;
          border-bottom: 1px solid #88bfe8;
          padding-bottom: 16px;
        }
        .stage-detail.last {
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }
        .edit-controls {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 8px;
        }
        .edit-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 4px 8px;
          border-radius: 4px;
          color: #340368;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .edit-button:hover {
          background: #e3f0fa;
        }
        .details-container {
          background: #fff;
          padding: 24px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 2px 8px rgba(136,191,232,0.08);
          border: 1.5px solid #88bfe8;
          border-top: none;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 12px;
        }
        .section {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
        }
        .section h4 {
          color: #340368;
          margin-bottom: 8px;
        }
        .item {
          margin-bottom: 8px;
          padding: 8px;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #88bfe8;
        }
        .item.wastage {
          border-color: #88bfe8;
        }
        .item.output {
          border-color: #340368;
        }
        .item .title {
          font-weight: 600;
        }
        .item .content {
          font-size: 0.9rem;
          color: #666;
        }
        .final-actions {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-top: 32px;
          padding: 24px;
          background: #ffffff;
          border-radius: 16px;
          border: 1.5px solid #88bfe8;
        }
        .no-data {
          color: #340368;
          padding: 16px;
          text-align: center;
        }
      </style>
      <div class="summary-container">
        <div class="header">
          <h2>Production Workflow Summary</h2>
          <div class="action-buttons">
            <button class="button" id="print">
              <span>🖨️</span>
              <span>Print</span>
            </button>
            <button class="button" id="reset">
              <span>↺</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
        <stage-flow stages='${JSON.stringify(summaryData)}'></stage-flow>
        <div class="details-container">
          <h3 style="color: #340368; margin-bottom: 16px;">Stage Details</h3>
          ${summaryData.length === 0 ? `
            <div class="no-data">No production stages data available to display.</div>
          ` : summaryData.map((stage, idx) => {
            console.log(`Rendering stage ${idx + 1} with data:`, {
              rawGoods: stage.rawGoods,
              middleFields: stage.middleFields,
              outputGoods: stage.outputGoods
            });
            return `
              <div class="stage-detail ${idx === summaryData.length - 1 ? 'last' : ''}">
                <div class="edit-controls">
                  <button class="edit-button" data-idx="${idx}">
                    <span>✏️</span> Edit Stage ${idx + 1}
                  </button>
                </div>
                <div class="grid">
                  <div>
                    <h4>Raw/Intermediate Goods</h4>
                    <div class="section">
                      ${stage.rawGoods && stage.rawGoods.length > 0 ? stage.rawGoods.map((g, i) => {
                        console.log(`Rendering rawGood ${i + 1} for stage ${idx + 1}:`, g);
                        return `
                          <div class="item">
                            <div class="title">${g.name || 'Unnamed Good'}</div>
                            <div class="content">Quantity: ${g.qty || 'N/A'} ${g.dimension || ''}</div>
                          </div>
                        `;
                      }).join('') : '<div class="item">No raw goods specified.</div>'}
                    </div>
                  </div>
                  <div>
                    <h4>Production Details</h4>
                    <div class="section">
                      ${stage.middleFields && stage.middleFields.wastageEntries && stage.middleFields.wastageEntries.length > 0 ? stage.middleFields.wastageEntries.map((entry, i) => {
                        console.log(`Rendering wastageEntry ${i + 1} for stage ${idx + 1}:`, entry);
                        return `
                          <div class="item wastage">
                            <div class="title">Wastage for ${entry.good || 'Unknown Good'}</div>
                            <div class="content">Amount: ${entry.wastage || 'N/A'}${entry.type === 'percent' ? '%' : ''}</div>
                          </div>
                        `;
                      }).join('') : '<div class="item">No wastage entries specified.</div>'}
                      <div class="item">
                        <div class="content">Time: ${stage.middleFields?.time || 'N/A'}</div>
                        <div class="content">Outsource: ${stage.middleFields?.outsource || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4>Output Goods</h4>
                    <div class="section">
                      ${stage.outputGoods && stage.outputGoods.length > 0 ? stage.outputGoods.map((g, i) => {
                        console.log(`Rendering outputGood ${i + 1} for stage ${idx + 1}:`, g);
                        return `
                          <div class="item output">
                            <div class="title">${g.name || 'Unnamed Good'}</div>
                            <div class="content">Quantity: ${g.qty || 'N/A'} ${g.dimension || ''}</div>
                          </div>
                        `;
                      }).join('') : '<div class="item">No output goods specified.</div>'}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
          <div class="final-actions">
            ${showEdit ? `<button class="button" id="edit-workflow">
              <span>✏️</span>
              <span>Edit Workflow</span>
            </button>` : ''}
            ${showSubmit ? `<button class="button primary" id="submit-workflow">
              <span>✓</span>
              <span>Submit Workflow</span>
            </button>` : ''}
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#reset').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('reset', {
        bubbles: true,
        composed: true
      }));
    });

    this.shadowRoot.querySelector('#print').addEventListener('click', () => {
      window.print();
    });

    const editBtn = this.shadowRoot.querySelector('#edit-workflow');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('edit-workflow', {
          bubbles: true,
          composed: true
        }));
      });
    }

    const submitBtn = this.shadowRoot.querySelector('#submit-workflow');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('submit-workflow', {
          detail: { data: { productionStages: this.stages } },
          bubbles: true,
          composed: true
        }));
      });
    }

    this.shadowRoot.querySelectorAll('.edit-button').forEach(button => {
      button.addEventListener('click', () => {
        const idx = parseInt(button.dataset.idx);
        this.dispatchEvent(new CustomEvent('edit', {
          detail: { index: idx },
          bubbles: true,
          composed: true
        }));
      });
    });
  }
}

customElements.define('production-summary', ProductionSummary);