export class BotonDetalles extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `

            <link href="public/vendor/css/bootstrap.min.css" rel="stylesheet" />
            <button class="btn btn-outline-success">Ver más</button>
        `;
        this.button = this.shadowRoot.querySelector('button');
        this.button.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('view-details', {
                detail: this.travel,
                bubbles: true,
                composed: true
            }));
        }
        );
    }
    set travel(data) {
        this._travel = data;
    }
    get travel() {
        return this._travel;
    }
}

customElements.define('boton-detalles', BotonDetalles);