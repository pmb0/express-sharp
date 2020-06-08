import {
  HttpException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from './http-exception'

describe('HttpExceptioin', () => {
  test('HttpException', () => {
    const exception = new HttpException(406, 'test')
    expect(exception.status).toBe(406)
    expect(exception.message).toBe('test')
  })

  test('BadRequestException', () => {
    const exception = new BadRequestException('test')
    expect(exception.status).toBe(400)
    expect(exception.message).toBe('test')
  })

  test('NotFoundException', () => {
    const exception = new NotFoundException('test')
    expect(exception.status).toBe(404)
    expect(exception.message).toBe('test')
  })

  test('ForbiddenException', () => {
    const exception = new ForbiddenException('test')
    expect(exception.status).toBe(403)
    expect(exception.message).toBe('test')
  })
})
