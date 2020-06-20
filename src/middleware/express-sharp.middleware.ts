import cors from 'cors'
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express'
import Keyv from 'keyv'
import { container } from 'tsyringe'
import { ConfigService } from '../config.service'
import { ExpressSharpOptions } from '../interfaces'
import { ResizeDto } from '../resize.dto'
import { etagCaching } from './etag-caching.middleware'
import { signedUrl } from './signed-url.middleware'
import { transformImage } from './transform-image.middleware'
import { transformQueryParams } from './transform-query-params.middleware'
import { useWebpIfSupported } from './use-webp-if-supported.middleware'
import { validate } from './validator.middleware'

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

  const middlewares = extractActiveMiddlewares([
    [
      (req: Request, res: Response, next: NextFunction) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        res.locals.imageAdapter = options.imageAdapter
        next()
      },
    ],
    [transformQueryParams],
    [validate<ResizeDto>(ResizeDto)],
    [useWebpIfSupported, options.autoUseWebp ?? true],
    [cors(options.cors)],
    [signedUrl, configService.get('signedUrl.secret') !== undefined],
    [etagCaching],
    [transformImage],
  ])

  const router = Router()
  router.get('/:url(*)', ...middlewares)
  return router
}
