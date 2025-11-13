export class TravelInfo extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <link href="/public/vendor/css/bootstrap.min.css" rel="stylesheet">

      <style>
        :host {
          display: block;
          width: 90%;
          margin: 1rem auto;
        }
        ul {
          padding: 0;
          margin: 0;
          list-style: none;
        }
      </style>

      <ul id="infoList" class="list-group"></ul>
    `;

    this.listEl = shadow.querySelector('#infoList');
  }

  set data(travel) {
    if (!travel) return;

    const items = [
      { label: 'Provincia', value: travel.province || '—' },
      { label: 'Altitud', value: travel.altitude || '—' },
      { label: 'Mejor temporada', value: travel.bestSeason || '—' },
      { label: 'Actividades', value: (travel.activities || []).join(', ') || '—' },
      { label: 'Consejos', value: travel.tips || '—' },
    ];

    this.listEl.innerHTML = '';

    items.forEach(info => {
      const item = document.createElement('travel-info-item');
      item.data = info;
      this.listEl.appendChild(item);
    });
  }
}

customElements.define('travel-info', TravelInfo);
