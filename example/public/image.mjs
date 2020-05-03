/* eslint-disable toplevel/no-toplevel-side-effect */

const template = document.createElement('template')

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
    this.shadowRoot.append(document.createElement('img'))
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.updateSrc()
  }

  buildUrl() {
    if (!this.url) return null
    const url = new URL(
      `${this.base}/resize/${this.width}/${this.height || this.width}`,
      document.location.href
    )
    url.searchParams.set('url', this.url)
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
