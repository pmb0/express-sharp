/* eslint-disable toplevel/no-toplevel-side-effect */
import imageUrl_ from './image-url'

describe('ImaegUrl', () => {
  let imageUrl: Function
  beforeEach(() => {
    imageUrl = imageUrl_('/foo')
  })

  test('width url', () => {
    expect(imageUrl(300, { foo: true })).toBe('/foo/resize/300?foo=true')
  })

  test('width/height url', () => {
    expect(imageUrl([300, 400], { foo: true })).toBe(
      '/foo/resize/300/400?foo=true'
    )
  })
})
