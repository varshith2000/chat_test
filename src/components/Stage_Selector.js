class StageSelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stages = 1;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f9f7e8;
        }
        .card {
          background: #fffbe6;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          padding: 32px 40px;
          min-width: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .label {
          font-size: 1.2rem;
          margin-bottom: 12px;
          font-family: 'Caveat', cursive;
        }
        .input {
          font-size: 1.1rem;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e0d7b6;
          margin-bottom: 20px;
          width: 80px;
          text-align: center;
        }
        .button {
          background: #6b8e23;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s;
        }
        .button:hover {
          background: #4e6b18;
        }
      </style>
      <div class="container">
        <div class="card">
          <label class="label" for="stages">How many production stages?</label>
          <input class="input" id="stages" type="number" min="1" value="${this.stages}" />
          <button class="button">Start</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#stages').addEventListener('input', (e) => {
      this.stages = Number(e.target.value);
    });

    this.shadowRoot.querySelector('button').addEventListener('click', (e) => {
      e.preventDefault();
      if (this.stages > 0) {
        this.dispatchEvent(new CustomEvent('select', {
          detail: { stages: this.stages },
          bubbles: true,
          composed: true
        }));
      }
    });
  }
}

customElements.define('stage-selector', StageSelector);