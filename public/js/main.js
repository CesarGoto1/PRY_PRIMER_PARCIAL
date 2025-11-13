import './travel-card.js';
import './travel-modal.js';
import './button-detalles.js';
import './auth.js';
import './booking-modal.js';
import './travel-info.js';
import './travel-info-item.js';
import './travel-map.js';
import './close-button.js';


async function cargarViajes() {
  try {
    const response = await fetch('./public/data/lugares.json');
    if (!response.ok) throw new Error('Error al cargar lugares.json');

    const travels = await response.json();
    renderTarjetas(travels);
  } catch (error) {
    console.error('Error cargando los viajes:', error);
  }
}

function renderTarjetas(travels) {
  const container = document.getElementById('travel-cards-container');
  if (!container) return;
  container.innerHTML = '';

  travels.forEach(travel => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4';

    const card = document.createElement('travel-card');
    card.travel = travel;

    col.appendChild(card);
    container.appendChild(col);
  });
}

function isAuthenticated() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('authToken');
    return !!(user || token);
  } catch {
    return false;
  }
}

document.addEventListener('open-booking', e => {
  if (!isAuthenticated()) {
    alert('Debes iniciar sesión para reservar.');
    e.stopImmediatePropagation();
    e.preventDefault();
    return;
  }
  const bookingModal = document.querySelector('booking-modal');
  if (bookingModal && typeof bookingModal.show === 'function') {
    bookingModal.show(e.detail);
  }
});

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-book]');
  if (!btn) return;
  if (!isAuthenticated()) {
    alert('Debes iniciar sesión para reservar.');
    e.stopImmediatePropagation();
    e.preventDefault();
    return;
  }
});

document.addEventListener('travel-view-more', e => {
  const modal = document.querySelector('travel-modal');
  if (modal && typeof modal.show === 'function') {
    modal.show(e.detail);
  }
});

const bookingLink = document.getElementById('bookingLink');
if (bookingLink) {
  bookingLink.addEventListener('click', async ev => {
    ev.preventDefault();

    if (!isAuthenticated()) {
      const loginModalEl = document.getElementById('loginModal');
      if (loginModalEl && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(loginModalEl).show();
      } else {
        alert('Debes iniciar sesión para ver tus reservas.');
      }
      return;
    }

    try {
      let listEl = document.querySelector('booking-list-modal');
      if (!listEl) {
        await import('./booking-list-modal.js');
        listEl = document.querySelector('booking-list-modal');
        if (!listEl) {
          const el = document.createElement('booking-list-modal');
          document.body.appendChild(el);
          listEl = el;
        }
      }

      await new Promise(r => setTimeout(r, 0));

      if (listEl && typeof listEl.show === 'function') listEl.show();
    } catch (err) {
      console.error('Error abriendo booking-list-modal:', err);
      alert('No se pudo abrir la lista de reservas.');
    }
  });
}

cargarViajes();