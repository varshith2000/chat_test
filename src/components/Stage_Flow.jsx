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
    if (name === 'stages') this.stages = JSON.parse(newValue || '[]');
    this.render();
  }

  getCardPos(colIdx, rowIdx) {
    const cardHeight = 80;
    const colWidth = 220;
    const rowGap = 24;
    const colGap = 60;
    return {
      x: colIdx * (colWidth + colGap) + colWidth / 2,
      y: rowIdx * (cardHeight + rowGap) + cardHeight / 2 + 60
    };
  }

  renderArrow(from, to, color = '#e0d7b6', thickness = 2, dashed = false, key) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    return `
      <svg
        style="position: absolute; left: ${from.x}px; top: ${from.y}px; width: ${len}px; height: ${Math.abs(dy) + 20}px; overflow: visible;"
        width="${len}"
        height="${Math.abs(dy) + 20}"
      >
        <line
          x1="0"
          y1="0"
          x2="${dx}"
          y2="${dy}"
          stroke="${color}"
          stroke-width="${thickness}"
          stroke-dasharray="${dashed ? '6,6' : '0'}"
          marker-end="url(#arrowhead-${key})"
        />
        <defs>
          <marker id="arrowhead-${key}" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L8,4 L0,8" fill="none" stroke="${color}" stroke-width="${thickness}" />
          </marker>
        </defs>
      </svg>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .flow-container {
          padding: 40px;
          margin: 20px 0;
          position: relative;
          overflow-x: auto;
          background: #fff;
        }
        .stage-row {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 60px;
          margin-bottom: 60px;
          position: relative;
        }
        .card-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 220px;
          position: relative;
        }
        .card {
          background: #ffffff; /* White background */
          border: 1px solid #88bfe8; /* Light blue border */
        }
        .arrow {
          stroke: #88bfe8; /* Light blue */
        }
        .card-title {
          font-weight: 600;
          color: #340368; /* Dark purple */
          margin-bottom: 8px;
        }
        .card-content {
          font-size: 0.9rem;
          color: #340368;
        }
      </style>
      <div class="flow-container">
        ${(this.stages || []).map((stage, stageIdx) => {
          const rawGoods = stage?.rawGoods || [];
          const wastageEntries = stage?.middleFields?.wastageEntries || [];
          const outputGoods = stage?.outputGoods || [];
          let arrowHTML = '';
          // Input to wastage arrows
          rawGoods.forEach((good, i) => {
            wastageEntries.forEach((entry, j) => {
              if (entry.good === good.name) {
                arrowHTML += this.renderArrow(
                  this.getCardPos(0, i),
                  this.getCardPos(1, j),
                  '#88bfe8', // Light blue
                  2,
                  false,
                  `inw-${stageIdx}-${i}-${j}`
                );
              }
            });
          });
          // Wastage to output arrows
          wastageEntries.forEach((entry, j) => {
            outputGoods.forEach((good, k) => {
              arrowHTML += this.renderArrow(
                this.getCardPos(1, j),
                this.getCardPos(2, k),
                '#340368', // Dark purple
                2,
                false,
                `wout-${stageIdx}-${j}-${k}`
              );
            });
          });
          // Stage-to-stage connection
          if (stageIdx < this.stages.length - 1 && outputGoods.length > 0 && (this.stages[stageIdx + 1]?.rawGoods?.length > 0)) {
            arrowHTML += this.renderArrow(
              this.getCardPos(2, outputGoods.length - 1),
              this.getCardPos(0, 0),
              '#88bfe8', // Light blue
              3,
              true,
              `stage-${stageIdx}`
            );
          }
          return `
            <div style="position: relative; margin-bottom: ${stageIdx < this.stages.length - 1 ? '80px' : '0'};">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 1.3rem; font-weight: 700; color: #340368; font-family: 'Caveat', cursive; letter-spacing: 1px; margin-bottom: 0;">
                  Stage ${stageIdx + 1}
                </div>
              </div>
              <div class="stage-row">
                <div class="card-col">
                  ${rawGoods.map((good, i) => `
                    <div class="card">
                      <div class="card-title">${good.name}</div>
                      <div class="card-content">Quantity: ${good.qty} ${good.dimension}</div>
                    </div>
                  `).join('')}
                </div>
                <div class="card-col">
                  ${wastageEntries.map((entry, i) => `
                    <div class="card wastage">
                      <div class="card-title">Wastage: ${entry.good}</div>
                      <div class="card-content">${entry.wastage}${entry.type === 'percent' ? '%' : ''} wastage</div>
                    </div>
                  `).join('')}
                </div>
                <div class="card-col">
                  ${outputGoods.map((good, i) => `
                    <div class="card output">
                      <div class="card-title">${good.name}</div>
                      <div class="card-content">Quantity: ${good.qty} ${good.dimension}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              ${arrowHTML}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

customElements.define('stage-flow', StageFlow);