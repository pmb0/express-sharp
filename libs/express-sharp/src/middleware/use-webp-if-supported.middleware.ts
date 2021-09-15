import { ResizeDto } from '@edged/common'
import { NextFunction, Request, Response } from 'express'

export function useWebpIfSupported(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { dto } = res.locals as { dto: ResizeDto }

  if (req.headers.accept?.includes('image/webp')) {
    dto.format = 'webp'
  }

  next()
}
