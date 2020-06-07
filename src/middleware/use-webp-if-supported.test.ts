import { useWebpIfSupported } from './use-webp-if-supported'
import { NextFunction, Response } from 'express'

describe('useWebpIfSupported()', () => {
  let next: jest.Mock<NextFunction>
  let response: Response

  beforeEach(() => {
    next = jest.fn()

    // @ts-ignore
    response = { locals: { dto: {} } }
  })

  it('sets the format to webp', () => {
    // @ts-ignore
    useWebpIfSupported({ headers: { accept: 'image/webp' } }, response, next)
    expect(response.locals.dto.format).toBe('webp')
  })

  it('does not change the image format ', () => {
    // @ts-ignore
    useWebpIfSupported({ headers: { accept: 'image/other' } }, response, next)
    expect(response.locals.dto.format).toBeUndefined()
  })
})
