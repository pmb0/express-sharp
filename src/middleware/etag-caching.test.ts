import { NextFunction, Response } from 'express'
import { etagCaching } from './etag-caching'

describe('etagCaching()', () => {
  let next: jest.Mock<NextFunction>
  let response: Response

  beforeEach(() => {
    next = jest.fn()

    // @ts-ignore
    response = {
      sendStatus: jest.fn(),
      setHeader: jest.fn(),
      locals: { dto: {} },
    }
  })

  it('sends a 304 status', () => {
    // @ts-ignore
    etagCaching({ fresh: true }, response, next)

    expect(response.setHeader).toBeCalledWith(
      'ETag',
      'W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"'
    )
    expect(next).not.toBeCalled()
    expect(response.sendStatus).toBeCalledWith(304)
  })

  it('does not send 304', () => {
    // @ts-ignore
    etagCaching({ fresh: false }, response, next)

    expect(response.setHeader).toBeCalledWith(
      'ETag',
      'W/"2-vyGp6PvFo4RvsFtPoIWeCReyIC8"'
    )
    expect(next).toBeCalled()
    expect(response.sendStatus).not.toBeCalled()
  })
})
