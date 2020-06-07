export class HttpException extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string) {
    super(400, message)
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(404, message)
  }
}
