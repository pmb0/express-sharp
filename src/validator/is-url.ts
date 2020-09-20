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
    try {
      // `url` is an absolute URI without host and protocol. Validating it by
      // by using any base URL
      new URL(url, 'https://example.com')
      return true
    } catch (error) {
      return false
    }
  }
}

export function IsUrl(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  return function (object: any, propertyName: string): void {
    registerDecorator({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUrlConstraint,
    })
  }
}
