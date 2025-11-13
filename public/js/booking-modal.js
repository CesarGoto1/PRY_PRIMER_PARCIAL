export class BookingModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <link href="/public/vendor/css/bootstrap.min.css" rel="stylesheet">
      <div class="modal fade" tabindex="-1" role="dialog" id="bookingModal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bookingTitle">Reservar tour</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <p id="bookingTravelTitle" class="fw-bold"></p>
              <div class="mb-2">
                <label class="form-label">Nombre</label>
                <input id="bkName" class="form-control" type="text" />
              </div>
              <div class="mb-2">
                <label class="form-label">Email</label>
                <input id="bkEmail" class="form-control" type="email" />
              </div>
              <div class="mb-2">
                <label class="form-label">Fecha</label>
                <input id="bkDate" class="form-control" type="date" />
              </div>
              <div class="mb-2">
                <label class="form-label">Personas</label>
                <input id="bkPeople" class="form-control" type="number" min="1" value="1" />
              </div>
              <div id="bkFeedback" class="text-danger small mt-1" style="display:none;"></div>
            </div>
            <div class="modal-footer">
              <button id="confirmBooking" type="button" class="btn btn-success">Confirmar reserva</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Referencias a los elementos
    this.modalEl = shadow.getElementById('bookingModal');
    this.titleEl = shadow.getElementById('bookingTitle');
    this.travelTitleEl = shadow.getElementById('bookingTravelTitle');
    this.nameInput = shadow.getElementById('bkName');
    this.emailInput = shadow.getElementById('bkEmail');
    this.dateInput = shadow.getElementById('bkDate');
    this.peopleInput = shadow.getElementById('bkPeople');
    this.feedbackEl = shadow.getElementById('bkFeedback');
    this.confirmBtn = shadow.getElementById('confirmBooking');

    // Variables internas
    this.bsModal = null;
    this._currentTravel = null;

    // Evento de confirmación
    this.confirmBtn.addEventListener('click', () => this._confirm());
  }

  connectedCallback() {
    if (window.bootstrap && !this.bsModal) {
      this.bsModal = new bootstrap.Modal(this.modalEl, {});
    }
  }

  // Mostrar modal con información del viaje
  show(travel) {
    this._currentTravel = travel || null;
    this.travelTitleEl.textContent = travel?.title ? `Tour: ${travel.title}` : 'Tour seleccionado';

    // Prefill nombre y email desde localStorage (si existen)
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (err) {
      user = null;
    }
    this.nameInput.value = (user && user.name) ? user.name : '';
    this.emailInput.value = (user && user.email) ? user.email : '';

    // Reset formulario
    this.dateInput.value = '';
    this.peopleInput.value = '1';
    this.feedbackEl.style.display = 'none';

    if (this.bsModal) this.bsModal.show();
  }

  // Confirmar reserva
  _confirm() {
    const name = (this.nameInput.value || '').trim();
    const email = (this.emailInput.value || '').trim();
    const date = this.dateInput.value;
    const people = parseInt(this.peopleInput.value || '1', 10);

    if (!name || !email || !date || !people) {
      this.feedbackEl.textContent = 'Por favor, completa todos los campos.';
      this.feedbackEl.style.display = 'block';
      return;
    }

    const booking = {
      travelTitle: this._currentTravel?.title || '—',
      travelId: this._currentTravel?.id ?? null,
      name,
      email,
      date,
      people,
      createdAt: new Date().toISOString()
    };

    // Guardar en localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('bookings', JSON.stringify(existing));
    } catch (err) {
      console.error('Error guardando reserva:', err);
    }

    // Emitir evento personalizado
    this.dispatchEvent(new CustomEvent('booking-made', {
      detail: booking,
      bubbles: true,
      composed: true
    }));

    // Ocultar feedback y cerrar modal
    this.feedbackEl.style.display = 'none';
    if (this.bsModal) this.bsModal.hide();

    alert('Reserva confirmada. ¡Gracias!');
  }
}

customElements.define('booking-modal', BookingModal);
