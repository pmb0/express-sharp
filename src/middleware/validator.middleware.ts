import { validate as validate_, ValidationError } from 'class-validator'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { BadRequestException } from '../http-exception'

export function validate<T>(Dto: { new (...args: any[]): T }): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new Dto({ ...req.query, ...req.params })

      const errors: ValidationError[] = await validate_(dto, {
        forbidUnknownValues: true,
      })

      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) =>
            Object.values(error.constraints || {})
          )
          .join(', ')
        next(new BadRequestException(message))
      } else {
        ;(res.locals as { dto: T }).dto = dto
        next()
      }
    } catch (error) {
      next(error)
    }
  }
}
