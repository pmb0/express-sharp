import { NextFunction, Request, RequestHandler, Response } from 'express'
import HttpException from '../http-exception'
import { plainToClass } from 'class-transformer'
import { ValidationError, validate as validate_ } from 'class-validator'

export function validate<T>(type: any): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(type, {
        ...req.query,
        ...req.params,
      })

      const errors: ValidationError[] = await validate_(dto, {
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
