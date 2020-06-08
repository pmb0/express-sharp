import { NextFunction, Request, Response } from 'express'

export function useWebpIfSupported(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { dto } = res.locals

  if (req.headers.accept?.includes('image/webp')) {
    dto.format = 'webp'
  }

  next()
}
