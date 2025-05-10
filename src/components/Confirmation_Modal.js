class ConfirmationModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.goodName = this.getAttribute('good-name') || '';
    this.open = this.getAttribute('open') === 'true';
    this.inputValue = this.goodName;
    this.render();
  }

  static get observedAttributes() {
    return ['open', 'good-name'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      this.open = newValue === 'true';
      this.inputValue = this.goodName;
    } else if (name === 'good-name') {
      this.goodName = newValue || '';
      this.inputValue = this.goodName;
    }
    this.render();
  }

  render() {
    if (!this.open) {
      this.shadowRoot.innerHTML = '';
      return;
    }
    this.shadowRoot.innerHTML = `
      <style>
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-box {
          background: #fffbe6;
          border-radius: 12px;
          padding: 32px 40px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.12);
          min-width: 320px;
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
          margin: 0 10px;
          transition: background 0.2s;
        }
        .button:hover {
          background: #4e6b18;
        }
        .button.cancel {
          background: #ccc;
          color: #333;
        }
        .button:disabled {
          background: #b5b5b5;
          cursor: not-allowed;
        }
        input {
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #e0d7b6;
          font-size: 1rem;
          min-width: 180px;
          margin-bottom: 8px;
          margin-right: 4px;
        }
      </style>
      <div class="modal-overlay">
        <div class="modal-box">
          <h2>New Good Detected</h2>
          <p>
            <span style="font-weight: 500;">
              <input
                type="text"
                value="${this.inputValue}"
                placeholder="Enter new product name"
                autofocus
              />
            </span>
            is not in the list. Add it to the master list?
          </p>
          <div style="margin-top: 24px;">
            <button class="button" id="confirm" ${!this.inputValue.trim() ? 'disabled' : ''}>Yes, Add</button>
            <button class="button cancel" id="cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const input = this.shadowRoot.querySelector('input');
    input.addEventListener('input', (e) => {
      this.inputValue = e.target.value;
      this.render();
    });

    this.shadowRoot.querySelector('#confirm').addEventListener('click', () => {
      if (this.inputValue.trim()) {
        this.dispatchEvent(new CustomEvent('confirm', {
          detail: { value: this.inputValue },
          bubbles: true,
          composed: true
        }));
      }
    });

    this.shadowRoot.querySelector('#cancel').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('cancel', {
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('confirmation-modal', ConfirmationModal);