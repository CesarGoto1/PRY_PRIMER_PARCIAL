export class CloseButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <link href="public/vendor/css/bootstrap.min.css" rel="stylesheet" />

      <button type="button" class="btn-close" aria-label="Cerrar"></button>
    `;

    this.button = shadow.querySelector('button');
  }

  connectedCallback() {
    this.button.addEventListener('click', () => {

      // Buscar si el botón está dentro de un modal Bootstrap
      const modal = this.closest('.modal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      }

      // Emitir evento personalizado
      this.dispatchEvent(new CustomEvent('close-click', {
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('close-button', CloseButton);
