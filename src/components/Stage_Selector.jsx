class StageSelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stages = 1;
    this.isSubmitted = false; // Track if the button has been clicked
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
          background: #fff;
        }
        .card {
          background: #ffffff;
          border: 2px solid #88bfe8;
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
          border: 1px solid #88bfe8;
          margin-bottom: 20px;
          width: 80px;
          text-align: center;
        }
        .button {
          background: #88bfe8;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 24px;
          font-size: 1.1rem;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s;
        }
        .button:hover {
          background: #340368;
        }
        .button:disabled {
          background: #88bfe8;
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
      <div class="container">
        <div class="card">
          <label class="label" for="stages">How many production stages?</label>
          <input class="input" id="stages" type="number" min="1" value="${this.stages}" />
          <button class="button" id="startButton" ${this.isSubmitted ? 'disabled' : ''}>Start</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#stages').addEventListener('input', (e) => {
      this.stages = Number(e.target.value);
    });

    const startButton = this.shadowRoot.querySelector('#startButton');
    startButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.stages > 0 && !this.isSubmitted) {
        this.isSubmitted = true;
        this.render(); // Re-render to disable the button
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