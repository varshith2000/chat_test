class StageFlow extends HTMLElement {
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
    if (name === 'stages') {
      this.stages = JSON.parse(newValue || '[]');
      this.render();
    }
  }

  renderFlowDiagram() {
    if (!this.stages || this.stages.length === 0) return '';

    return `
      <div class="flow-container">
        <div class="flow-grid">
          ${this.stages.map((stage, idx) => {
            const rawGoods = stage.rawGoods || [];
            const wastage = stage.middleFields?.wastageEntries || [];
            const outputGoods = stage.outputGoods || [];
            
            const isLast = idx === this.stages.length - 1;
            
            return `
              <div class="stage-block">
                <div class="stage-header">Stage ${idx + 1}</div>
                <div class="flow-row">
                  ${rawGoods.map(good => `
                    <div class="flow-item input">
                      <div class="item-name">${good.name}</div>
                      <div class="item-details">Quantity: ${good.qty} ${good.dimension}</div>
                    </div>
                  `).join('')}
                  ${wastage.map(entry => `
                    <div class="flow-arrow">
                      <div class="arrow-text">Wastage: ${entry.good} ${entry.wastage}${entry.type === 'percent' ? '%' : ''}</div>
                    </div>
                  `).join('')}
                  ${outputGoods.map(good => `
                    <div class="flow-item output">
                      <div class="item-name">${good.name}</div>
                      <div class="item-details">Quantity: ${good.qty} ${good.dimension}</div>
                    </div>
                  `).join('')}
                </div>
                ${!isLast ? '<div class="stage-arrow">→</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .flow-container {
          padding: 20px;
          overflow-x: auto;
          background: #fff;
          display: flex;
          justify-content: center;
        }
        .flow-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          min-width: min-content;
          max-width: 1200px;
          margin: 0 auto;
        }
        .stage-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          min-width: 200px;
          text-align: center;
        }
        .stage-header {
          font-weight: bold;
          color: #340368;
          padding: 8px 16px;
          border-radius: 4px;
          background: #f0f0f0;
          display: inline-block;
          margin: 0 auto;
        }
        .flow-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          position: relative;
        }
        .flow-item {
          padding: 8px;
          border: 1px solid #88bfe8;
          border-radius: 4px;
          background: #fff;
          min-width: 180px;
          max-width: 220px;
          text-align: center;
          margin: 0 auto;
        }
        .item-name {
          font-weight: 600;
          color: #340368;
        }
        .item-details {
          font-size: 0.9em;
          color: #666;
        }
        .flow-arrow {
          position: relative;
          height: 30px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flow-arrow::before {
          content: '↓';
          font-size: 20px;
          color: #88bfe8;
        }
        .arrow-text {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8em;
          color: #666;
          width: auto;
          min-width: 120px;
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          padding: 2px 6px;
          border-radius: 3px;
        }
        .stage-arrow {
          font-size: 24px;
          color: #88bfe8;
          margin: 0 10px;
        }
      </style>
      ${this.renderFlowDiagram()}
    `;
  }
}

customElements.define('stage-flow', StageFlow);