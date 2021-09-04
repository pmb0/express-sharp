import { QueryParams } from '@edged/core'
import { NextFunction, Request, Response } from 'express'

export function transformQueryParams(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  Object.entries(QueryParams)
    .filter(([, shortName]: [string, string]) => shortName in req.query)
    .forEach(([name, shortName]) => {
      req.query[name] = req.query[shortName]
      delete req.query[shortName]
    })

  next()
}
