import cors from 'cors'
import {
  NextFunction,
  Request,
  Response,
  Router,
  RequestHandler,
} from 'express'
import Keyv from 'keyv'
import { container } from 'tsyringe'
import { ExpressSharpOptions } from '../interfaces'
import { ResizeDto } from '../resize.dto'
import { Transformer } from '../transformer.service'
import { etagCaching } from './etag-caching.middleware'
import { signedUrl } from './signed-url.middleware'
import { transformQueryParams } from './transform-query-params.middleware'
import { useWebpIfSupported } from './use-webp-if-supported.middleware'
import { validate } from './validator.middleware'
import { ConfigService } from '../config.service'

export async function getImage(
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

function extractActiveMiddlewares(
  middlewaresDefinitions: [RequestHandler, boolean?][]
): RequestHandler[] {
  return middlewaresDefinitions
    .filter(([, active]) => active ?? true)
    .map(([middleware]) => middleware)
}

export function expressSharp(options: ExpressSharpOptions): Router {
  const configService = container.resolve(ConfigService)

  if (options.secret) {
    configService.set('signedUrl.secret', options.secret)
  }

  container.register<Keyv>(Keyv, { useValue: options.cache || new Keyv() })
  container.registerInstance('imageAdapter', options.imageAdapter)

  const middlewares = extractActiveMiddlewares([
    [transformQueryParams],
    [validate<ResizeDto>(ResizeDto)],
    [useWebpIfSupported, options.autoUseWebp ?? true],
    [cors(options.cors)],
    [signedUrl, configService.get('signedUrl.secret') !== undefined],
    [etagCaching],
  ])

  const router = Router()
  router.get('/:url', ...middlewares, getImage)
  return router
}
