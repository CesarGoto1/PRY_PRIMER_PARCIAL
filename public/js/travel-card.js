export class TravelCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <link href="public/vendor/css/bootstrap.min.css" rel="stylesheet" />
      <link href="public/css/travel-card.css" rel="stylesheet" />
      <div class="card">
        <img />
        <div class="card-body">
          <h5 class="card-title"></h5>
          <boton-detalles></boton-detalles>
        </div>
      </div>
    `;

    this._travel = null;
    this._onViewDetails = this._onViewDetails.bind(this);
  }

  set travel(data) {
    this._travel = data;
    this.actualizarCard();
  }

  actualizarCard() {
    if (!this._travel) return;

    const img = this.shadowRoot.querySelector('img');
    const titulo = this.shadowRoot.querySelector('h5');
    const boton = this.shadowRoot.querySelector('boton-detalles');

    if (img) {
      img.src = this._travel.photo;
      img.alt = this._travel.title;
    }

    if (titulo) {
      titulo.textContent = this._travel.title;
    }

    if (boton) {
      boton.travel = this._travel;
      boton.removeEventListener('view-details', this._onViewDetails);
      boton.addEventListener('view-details', this._onViewDetails);
    }
  }


  _onViewDetails(e) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('travel-view-more', {
      detail: this._travel,
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('travel-card', TravelCard);
