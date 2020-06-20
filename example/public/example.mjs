/* eslint-disable toplevel/no-toplevel-side-effect */

import { TestImage } from './image.mjs'
import { setValue } from './utils.mjs'

const template = document.createElement('template')

template.innerHTML = `
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">

<style>
:host {
  display: block;
  width: 100%;
  border: 1px solid #999;
  margin: 30px 0;
  padding: 10px;
}
#scrollable {
  overflow: auto;
  overflow-y: hidden;
  margin: -10px;
  width: 100%;
}
</style>

<div class="form-group">
  <label for="base">Adapter</label>
  <select id="base" class="form-control">
    <option value="/local-http">local-http</option>
    <option value="/lorempixel">lorempixel</option>
    <option value="/fs">fs</option>
    <option value="/s3">s3</option>
  </select>
</div>

<div class="form-group">
  <label for="url">ID/URL</label>
  <input id="url" name="url" class="form-control">
</div>

<div class="form-group">
  <label for="width">Width</label>
  <input class="form-control" type="number" id="width" name="width">
</div>

<div class="form-group">
  <label for="height">Height</label>
  <input class="form-control" type="number" id="height" name="height" placeholder="Defaults to width">
</div>

<div class="form-group">
  <label for="quality">Quality</label>
  <input class="form-control" id="quality" name="quality" type="range" min="1" max="100">
</div>

<div class="form-group">
  <label for="crop">Crop</label>
  <select id="crop" class="form-control">
    <option value="">(None)</option>
    <option>north</option>
    <option>northeast</option>
    <option>southeast</option>
    <option>south</option>
    <option>southwest</option>
    <option>west</option>
    <option>northwest</option>
    <option>east</option>
    <option>center</option>
    <option>centre</option>
  </select>
</div>

<p>URL: <code></code></p>
<div id="scrollable">
  <test-image></test-image>
</div>
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

    setValue(this.shadowRoot.querySelector(`#${name}`), newValue)
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
