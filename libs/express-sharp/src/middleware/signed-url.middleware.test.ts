import { ConfigService } from '@edged/config'
import { NextFunction } from 'express'
import { container } from 'tsyringe'
import { ForbiddenException } from '../http-exception'
import { signedUrl } from './signed-url.middleware'

describe('signedUrl()', () => {
  let next: jest.Mock<NextFunction>

  beforeAll(() => {
    container.resolve(ConfigService).set('signedUrl.secret', 'test')
  })

  beforeEach(() => {
    next = jest.fn()
  })

  it('accepts valid signatures', () => {
    const request = {
      get() {
        return 'example.com'
      },
      originalUrl: '/foo?s=5llwo-ByfwrHXVIfMv-c6VRF4D8c9891t4tJ1oitcC8',
      protocol: 'https',
    }

    // @ts-ignore
    signedUrl(request, {}, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('throws a ForbiddenException if the signature is invalid', () => {
    const request = {
      get() {
        return 'example.com'
      },
      originalUrl: '/foo?s=invalid',
      protocol: 'https',
    }

    // @ts-ignore
    signedUrl(request, {}, next)

    expect(next).toHaveBeenCalledWith(
      new ForbiddenException('Invalid signature'),
    )
  })
})
