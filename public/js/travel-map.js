// /components/travel-map.js
const template = document.createElement('template');
template.innerHTML = `
  <style>
    iframe {
      height: 400px;
      width: 90%;
      border: 2px solid #aaa;
      border-radius: 0.5rem;
      display: block;
      margin: 1.5rem auto;
    }
  </style>
  <iframe loading="lazy"></iframe>
`;

export class TravelMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.mapEl = this.shadowRoot.querySelector('iframe');
  }

  set location(loc) {
    if (!loc?.lat || !loc?.lng) {
      this.mapEl.src = '';
      return;
    }
    const { lat, lng } = loc;
    const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.02}%2C${lat-0.02}%2C${lng+0.02}%2C${lat+0.02}&layer=mapnik&marker=${lat}%2C${lng}`;
    this.mapEl.src = embedUrl;
  }
}

customElements.define('travel-map', TravelMap);
