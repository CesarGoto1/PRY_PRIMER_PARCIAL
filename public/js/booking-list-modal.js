export class BookingListModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <link href="/public/vendor/css/bootstrap.min.css" rel="stylesheet">

      <div class="modal fade" tabindex="-1" role="dialog" id="bookingListModal" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            
            <div class="modal-header">
              <h5 class="modal-title">Mis Reservas</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
              <div id="bookingContainer" class="list-group"></div>

              <div id="emptyMessage" class="alert alert-info mt-3 d-none">
                No tienes reservas realizadas.
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Elementos
    this.modalEl = shadow.querySelector("#bookingListModal");
    this.container = shadow.querySelector("#bookingContainer");
    this.emptyMessage = shadow.querySelector("#emptyMessage");

    // Bootstrap modal instance
    this.bsModal = null;
  }

  connectedCallback() {
    if (window.bootstrap && !this.bsModal) {
      this.bsModal = new bootstrap.Modal(this.modalEl);
    }
  }

  show() {
    this._loadBookings();
    if (this.bsModal) this.bsModal.show();
  }

  _loadBookings() {
    let bookings = [];

    try {
      bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    } catch {
      bookings = [];
    }

    this.container.innerHTML = "";

    if (bookings.length === 0) {
      this.emptyMessage.classList.remove("d-none");
      return;
    }

    this.emptyMessage.classList.add("d-none");

    bookings.forEach((b, index) => {
      const item = document.createElement("div");
      item.className = "list-group-item";

      item.innerHTML = `
        <h6 class="fw-bold mb-1">${b.travelTitle}</h6>
        <p class="mb-1">
          <strong>Cliente:</strong> ${b.name}<br>
          <strong>Email:</strong> ${b.email}<br>
          <strong>Fecha:</strong> ${b.date}<br>
          <strong>Personas:</strong> ${b.people}
        </p>
        <small class="text-muted">Reservado el: ${new Date(b.createdAt).toLocaleString()}</small>
      `;

      this.container.appendChild(item);
    });
  }
}

customElements.define("booking-list-modal", BookingListModal);
