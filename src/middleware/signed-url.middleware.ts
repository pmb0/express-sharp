import { NextFunction, Request, Response } from 'express'
import { container } from 'tsyringe'
import { ForbiddenException } from '../http-exception'
import { UrlSigner } from '../signed-url.service'

export function signedUrl(req: Request, res: Response, next: NextFunction) {
  const signer = container.resolve(UrlSigner)

  if (signer.verify(`${req.protocol}://${req.get('host')}${req.originalUrl}`)) {
    next()
    return
  }

  next(new ForbiddenException('Invalid signature'))
}
