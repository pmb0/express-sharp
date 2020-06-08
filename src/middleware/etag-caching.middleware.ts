import etag from 'etag'
import { Request, Response, NextFunction } from 'express'

export function etagCaching(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  res.setHeader('ETag', etag(JSON.stringify(res.locals.dto), { weak: true }))

  if (!req.fresh) {
    next()
    return
  }

  res.sendStatus(304)
}
