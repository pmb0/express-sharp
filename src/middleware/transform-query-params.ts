import { NextFunction, Request, Response } from 'express'
import { QueryParams } from '../interfaces'

export function transformQueryParams(
  req: Request,
  res: Response,
  next: NextFunction
) {
  Object.entries(QueryParams)
    .filter(([name, shortName]: [string, string]) => shortName in req.query)
    .forEach(([name, shortName]) => {
      req.query[name] = req.query[shortName]
      delete req.query[shortName]
    })

  next()
}
