import { UrlSigner } from '@edged/common'
import { NextFunction, Request, Response } from 'express'
import { container } from 'tsyringe'
import { ForbiddenException } from '../http-exception'

export function signedUrl(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const signer = container.resolve(UrlSigner)

  if (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    signer.verify(`${req.protocol}://${req.get('host')!}${req.originalUrl}`)
  ) {
    next()
    return
  }

  next(new ForbiddenException('Invalid signature'))
}
