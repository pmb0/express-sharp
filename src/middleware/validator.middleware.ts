import { NextFunction, Request, RequestHandler, Response } from 'express'
import { BadRequestException } from '../http-exception'
import { plainToClass } from 'class-transformer'
import { ValidationError, validate as validate_ } from 'class-validator'
import { ClassType } from 'class-transformer/ClassTransformer'

export function validate<T>(Dto: ClassType<T>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass<T, typeof req.query>(Dto, {
        ...req.query,
        ...req.params,
      })

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        res.locals.dto = dto
        next()
      }
    } catch (error) {
      next(error)
    }
  }
}
