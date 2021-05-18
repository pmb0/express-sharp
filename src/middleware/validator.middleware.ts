import { validate as validate_, ValidationError } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { BadRequestException } from '../http-exception'

// eslint-disable-next-line @typescript-eslint/ban-types
export function validate<T extends {}>(Dto: {
  new (...args: any[]): T
}): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = new Dto({ ...req.query, ...req.params })

      const errors: ValidationError[] = await validate_(dto, {
        forbidUnknownValues: true,
      })

      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) =>
            Object.values(error.constraints ?? {}),
          )
          .join(', ')

        next(new BadRequestException(message || 'Unknown error'))
      } else {
        ;(res.locals as { dto: T }).dto = dto
        next()
      }
    } catch (error) {
      next(error)
    }
  }
}
