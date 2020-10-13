import { IsUrlConstraint } from './is-url'

describe('IsUrl', () => {
  let urlConstraint: IsUrlConstraint

  beforeEach(() => {
    urlConstraint = new IsUrlConstraint()
  })

  test('validate()', () => {
    expect(urlConstraint.validate('')).toBeFalsy()
    // @ts-ignore
    expect(urlConstraint.validate()).toBeFalsy()
    // @ts-ignore
    expect(urlConstraint.validate(null)).toBeFalsy()
    // @ts-ignore
    expect(urlConstraint.validate(undefined)).toBeFalsy()
    expect(urlConstraint.validate('\t')).toBeFalsy()
    expect(urlConstraint.validate('\\')).toBeFalsy()
    expect(urlConstraint.validate('../')).toBeFalsy()

    expect(urlConstraint.validate('/foo/bar.html')).toBeTruthy()
    expect(urlConstraint.validate('/foo/bar.html?a=b')).toBeTruthy()
  })
})
