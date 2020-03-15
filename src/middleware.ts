import cors from 'cors'
import debug_ from 'debug'
import etag from 'etag'
import express, {
  Request,
  Response,
  RequestHandler,
  NextFunction,
  Errback,
} from 'express'
import got from 'got'
import sharp from 'sharp'
import transform from './transform'
import url from 'url'
import { plainToClass } from 'class-transformer'
import { ValidationError, validate } from 'class-validator'
import HttpException from './http-exception'
import ResizeDto from './resize.dto'

const debug = debug_('express-sharp')

export function getImageUrl(baseHost: string, inputUrl: string) {
  const imageUrl = url.parse(inputUrl)
  imageUrl.host = baseHost.replace('https://', '').replace('http://', '')
  imageUrl.protocol = baseHost.startsWith('https') ? 'https' : 'http'
  return url.format(imageUrl)
}

function validationMiddleware<T>(type: any): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(type, {
        ...req.query,
        ...req.params,
      })

      const errors: ValidationError[] = await validate(dto, {
        forbidUnknownValues: true,
      })

      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) => Object.values(error.constraints))
          .join(', ')
        next(new HttpException(400, message))
      } else {
        res.locals.dto = dto
        next()
      }
    } catch (error) {
      next(error)
    }
  }
}

export default function(options: any = {}) {
  const router = express.Router()

  router.get(
    '/resize/:width/:height?',
    validationMiddleware(ResizeDto),
    cors(options.cors || {}),
    // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
    async (req: Request, res: Response, next: NextFunction) => {
      const { dto } = res.locals
      dto.format = req.headers.accept?.includes('image/webp')
        ? 'webp'
        : dto.format

      const baseHost = options.baseHost || req.headers.host

      const imageUrl = getImageUrl(baseHost, dto.url)
      try {
        const etagBuffer = Buffer.from([
          imageUrl,
          dto.width,
          dto.height,
          dto.format,
          dto.quality,
        ])

        res.setHeader('ETag', etag(etagBuffer, { weak: true }))
        if (req.fresh) {
          res.sendStatus(304)
          return
        }

        debug('Requesting:', imageUrl)
        let response
        try {
          response = await got(imageUrl, {
            responseType: 'buffer',
          })
        } catch (error) {
          res.sendStatus(error.response.statusCode)
          return
        }

        debug('Requested %s. Status: %s', imageUrl, response.statusCode)

        // TODO: Cache-Control, Last-Modified

        res.status(response.statusCode)
        const { buffer, format } = await transform(response.body, dto)
        res.type(`image/${format}`)
        res.send(buffer)
      } catch (error) {
        if (error.statusCode === 404) {
          next()
          return
        }
        next(error)
      }
    }
  )

  return router
}
