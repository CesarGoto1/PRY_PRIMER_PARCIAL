import { getUser } from '/public/js/auth.js';

export class TravelModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <link href="/public/vendor/css/bootstrap.min.css" rel="stylesheet">
      <link href="/public/css/travel-modal.css" rel="stylesheet">

      <div class="modal fade" tabindex="-1" role="dialog" id="travelModal" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalTitle"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body text-center">
              <img id="modalImage" />
              <p id="modalDescription" class="mt-3"></p>

              <!-- Info del viaje -->
              <travel-info id="info"></travel-info>

              <!-- Mapa -->
              <travel-map id="map"></travel-map>

              <div id="loginAlert" class="alert alert-warning mt-3 d-none" role="alert">
                Debes iniciar sesión para poder reservar este tour.
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
              <button type="button" id="reserveBtn" class="btn btn-success">Reservar tour</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._modalElement = shadow.querySelector('#travelModal');
    this._titleEl = shadow.querySelector('#modalTitle');
    this._imageEl = shadow.querySelector('#modalImage');
    this._descEl = shadow.querySelector('#modalDescription');
    this._infoEl = shadow.querySelector('#info');
    this._mapEl = shadow.querySelector('#map');
    this._alertEl = shadow.querySelector('#loginAlert');
    this._reserveBtn = shadow.querySelector('#reserveBtn');

    this._bsModal = null;
    this._currentTravel = null;

    this._onReserveClick = this._onReserveClick.bind(this);
  }

  connectedCallback() {
    if (window.bootstrap && !this._bsModal) {
      this._bsModal = new bootstrap.Modal(this._modalElement);
    }

    if (this._reserveBtn && !this._reserveBtn._hasReserveHandler) {
      this._reserveBtn.addEventListener('click', this._onReserveClick);
      this._reserveBtn._hasReserveHandler = true;
    }
  }

  disconnectedCallback() {
    if (this._reserveBtn && this._onReserveClick) {
      this._reserveBtn.removeEventListener('click', this._onReserveClick);
      this._reserveBtn._hasReserveHandler = false;
    }
  }

  async _onReserveClick() {
    const user = getUser();
    if (!user || !user.name) {
      this._mostrarAlerta();
      return;
    }

    if (!this._currentTravel) return;

    try {
      let bookingEl = document.querySelector('booking-modal');

      if (!bookingEl) {
        await import('./booking-modal.js');
        bookingEl = document.querySelector('booking-modal');

        if (!bookingEl) {
          const el = document.createElement('booking-modal');
          document.body.appendChild(el);
          bookingEl = el;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 0));

      if (bookingEl && typeof bookingEl.show === 'function') {
        bookingEl.show(this._currentTravel);
      } else {
        document.dispatchEvent(new CustomEvent('open-booking', {
          detail: { travel: this._currentTravel },
          bubbles: true
        }));
      }
    } catch (err) {
      console.error('Error al abrir booking-modal:', err);
      document.dispatchEvent(new CustomEvent('open-booking', {
        detail: { travel: this._currentTravel, error: err },
        bubbles: true
      }));
    }
  }

  _mostrarAlerta() {
    this._alertEl.classList.remove('d-none');
    this._alertEl.textContent = 'Debes iniciar sesión para reservar.';
    
    if (loginModalEl && window.bootstrap) {
      const bsLogin = bootstrap.Modal.getOrCreateInstance(loginModalEl);
      bsLogin.show();
    }
    setTimeout(() => {
      this._alertEl.classList.add('d-none');
    }, 4000);
  }

  show(travel) {
    if (!this._bsModal || !travel) return;
    this._currentTravel = travel;

    this._titleEl.textContent = travel.title;
    this._imageEl.src = travel.photo;
    this._descEl.textContent = travel.description;

    this._infoEl.data = travel;
    this._mapEl.location = travel.location;

    this._bsModal.show();
  }
}

customElements.define('travel-modal', TravelModal);
