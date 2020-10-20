import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { URL } from 'url'

@ValidatorConstraint()
export class IsUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    if (!url) {
      return false
    }

    try {
      // `url` is an absolute URI without host and protocol. Validating it by
      // by using any base URL
      const parsedUrl = new URL(url, 'https://example.com')

      return !/^\/+$/.test(parsedUrl.pathname)
    } catch {
      return false
    }
  }
}

export function IsUrl(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  return function (object: any, propertyName: string): void {
    registerDecorator({
      constraints: [],

      options: validationOptions,

      propertyName: propertyName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      target: object.constructor,
      validator: IsUrlConstraint,
    })
  }
}
