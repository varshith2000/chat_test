class ProductionSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stages = JSON.parse(this.getAttribute('stages') || '[]');
    this.render();
  }

  static get observedAttributes() {
    return ['stages'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'stages') this.stages = JSON.parse(newValue || '[]');
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .summary-container {
          margin: 32px auto;
          max-width: 1400px;
        }
        .header {
          background: #fffbe6;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h2 {
          color: #6b8e23;
          margin: 0;
        }
        .action-buttons {
          display: flex;
          gap: 12px;
        }
        .button {
          background: #6b8e23;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .button.secondary {
          background: #f0f0f0;
          color: #666;
          border: 1px solid #ddd;
        }
        .button:hover {
          background: #597a1d;
        }
        .button.secondary:hover {
          background: #e0e0e0;
        }
        .stage-detail {
          margin-bottom: 32px;
          border-bottom: 1px solid #e0d7b6;
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
          color: #6b8e23;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .edit-button:hover {
          background: #f0f0f0;
        }
        .details-container {
          background: #fff;
          padding: 24px;
          border-radius: 0 0 16px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 12px;
        }
        .section {
          background: #f8faf4;
          padding: 12px;
          border-radius: 8px;
        }
        .section h4 {
          color: #6b8e23;
          margin-bottom: 8px;
        }
        .item {
          margin-bottom: 8px;
          padding: 8px;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #e0d7b6;
        }
        .item.wastage {
          border-color: #f7c873;
        }
        .item.output {
          border-color: #6b8e23;
        }
        .item .title {
          font-weight: 600;
        }
        .item .content {
          font-size: 0.9rem;
          color: #666;
        }
      </style>
      <div class="summary-container">
        <div class="header">
          <h2>Production Stages Summary</h2>
          <div class="action-buttons">
            <button class="button secondary" id="reset">
              <span>↺</span> Reset
            </button>
            <button class="button" id="print">
              <span>🖨️</span> Print
            </button>
          </div>
        </div>
        <stage-flow stages='${JSON.stringify(this.stages)}'></stage-flow>
        <div class="details-container">
          <h3 style="color: #6b8e23; margin-bottom: 16px;">Stage Details</h3>
          ${(this.stages || []).map((stage, idx) => `
            <div class="stage-detail ${idx === (this.stages?.length || 0) - 1 ? 'last' : ''}">
              <div class="edit-controls">
                <button class="edit-button" data-idx="${idx}">
                  <span>✏️</span> Edit Stage ${idx + 1}
                </button>
              </div>
              <div class="grid">
                <div>
                  <h4>Raw/Intermediate Goods</h4>
                  <div class="section">
                    ${(stage?.rawGoods || []).map((g, i) => `
                      <div class="item">
                        <div class="title">${g.name}</div>
                        <div class="content">Quantity: ${g.qty} ${g.dimension}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div>
                  <h4>Production Details</h4>
                  <div class="section">
                    ${(stage?.middleFields?.wastageEntries || []).map((entry, i) => `
                      <div class="item wastage">
                        <div class="title">Wastage for ${entry.good}</div>
                        <div class="content">Amount: ${entry.wastage}${entry.type === 'percent' ? '%' : ''}</div>
                      </div>
                    `).join('')}
                    <div class="item">
                      <div class="content">Time: ${stage?.middleFields?.time}</div>
                      <div class="content">Outsource: ${stage?.middleFields?.outsource}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4>Output Goods</h4>
                  <div class="section">
                    ${(stage?.outputGoods || []).map((g, i) => `
                      <div class="item output">
                        <div class="title">${g.name}</div>
                        <div class="content">Quantity: ${g.qty} ${g.dimension}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
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