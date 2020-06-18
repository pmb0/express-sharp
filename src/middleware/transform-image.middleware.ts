import { NextFunction, Request, Response } from 'express'
import { container } from 'tsyringe'
import { ResizeDto } from '../resize.dto'
import { Transformer } from '../transformer.service'

export async function transformImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { dto } = res.locals as { dto: ResizeDto }

  try {
    const transformer = container.resolve(Transformer)

    if (!dto.url) throw new Error('Image url missing')
    const { format, image } = await transformer.transform(dto.url, dto)

    if (!image || !format) {
      next()
      return
    }

    // TODO: Cache-Control, Last-Modified
    res.type(`image/${format}`)
    res.send(image)
  } catch (error) {
    next(error)
  }
}
