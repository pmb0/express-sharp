/* eslint-disable toplevel/no-toplevel-side-effect */

import { TestImage } from './image.mjs'

const template = document.createElement('template')

template.innerHTML = `
<style>
:host {
  display: block;
  width: 100%;
  border: 1px solid black;
  margin: 10px 0;
  overflow: scroll;
}
</style>

<label for="base">base</label>
<select id="base">
  <option>local-http</option>
  <option>lorempixel</option>
  <option>fs</option>
</select>

<label for="quality">quality</label>
<input id="quality" name="quality" type="range" min="1" max="100">

<pre>URL: <code></code></p>
<test-image></test-image>
`

export class TestExample extends HTMLElement {
  static observedAttributes = [
    'base',
    'url',
    'quality',
    'width',
    'height',
    'crop',
  ]

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))
  }

  connectedCallback() {
    TestExample.observedAttributes.forEach((attribute) => {
      this.shadowRoot
        .querySelector(`#${attribute}`)
        ?.addEventListener('change', (event) => {
          console.log('Set:', attribute, event.target.value)
          this.setAttribute(attribute, event.target.value)
        })
    })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.testImage.setAttribute(name, newValue)
    this.shadowRoot.querySelector(
      'code'
    ).textContent = this.testImage.buildUrl()
    console.log(name, newValue)
    // this.shadowRoot.querySelector(`#${name}`)?.value = newValue
  }

  get testImage() {
    return this.shadowRoot.querySelector('test-image')
  }

  get base() {
    return this.getAttribute('base')
  }

  get url() {
    return this.getAttribute('url')
  }

  get quality() {
    return this.getAttribute('quality')
  }
}
customElements.define('test-example', TestExample)
