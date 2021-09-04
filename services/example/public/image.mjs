/* eslint-disable toplevel/no-toplevel-side-effect */

const template = document.createElement('template')

template.innerHTML = `
<style>
:host {
  display: block;
}
</style>

<img>
`

export class TestImage extends HTMLElement {
  static observedAttributes = [
    'base',
    'crop',
    'height',
    'quality',
    'url',
    'width',
  ]

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.updateSrc()
  }

  buildUrl() {
    if (!this.url) return null

    const url = new URL(`${this.base}${this.url}`, document.location.href)
    if (this.width) url.searchParams.set('w', this.width)
    if (this.height) url.searchParams.set('h', this.height)

    if (this.quality) url.searchParams.set('quality', this.quality)
    if (this.crop) {
      url.searchParams.set('crop', 'true')
      url.searchParams.set('gravity', this.crop)
    }
    return url.toString()
  }

  updateSrc() {
    const src = this.buildUrl()

    if (src) this.img.src = src
  }

  get url() {
    return this.getAttribute('url')
  }

  get base() {
    return this.getAttribute('base')
  }

  get quality() {
    return this.getAttribute('quality')
  }

  get width() {
    return this.getAttribute('width')
  }

  get height() {
    return this.getAttribute('height')
  }

  get crop() {
    return this.getAttribute('crop')
  }

  get img() {
    return this.shadowRoot.querySelector('img')
  }
}
customElements.define('test-image', TestImage)
