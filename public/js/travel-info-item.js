
export class TravelInfoItem extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <link href="/public/vendor/css/bootstrap.min.css" rel="stylesheet">
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <strong id="label" class="text-dark"></strong>
        <span id="value" class="text-secondary"></span>
      </li>
    `;

    this._labelEl = shadow.querySelector('#label');
    this._valueEl = shadow.querySelector('#value');
  }

  static get observedAttributes() {
    return ['label', 'value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'label') this._labelEl.textContent = `${newValue}:`;
    if (name === 'value') this._valueEl.textContent = newValue;
  }

  set data({ label, value }) {
    this.setAttribute('label', label);
    this.setAttribute('value', value);
  }
}

customElements.define('travel-info-item', TravelInfoItem);
