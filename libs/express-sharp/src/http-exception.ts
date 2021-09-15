/* eslint-disable no-magic-numbers */

export class HttpException extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    Error.captureStackTrace(this, HttpException)
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(400, message)
    Error.captureStackTrace(this, BadRequestException)
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(404, message)
    Error.captureStackTrace(this, NotFoundException)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(403, message)
    Error.captureStackTrace(this, ForbiddenException)
  }
}
