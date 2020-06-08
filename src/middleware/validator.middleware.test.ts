import { IsDefined, IsOptional, Min } from 'class-validator'
import { NextFunction } from 'express'
import { BadRequestException, HttpException } from '../http-exception'
import { validate } from './validator.middleware'
import * as ClassTransformer from 'class-transformer'

class TestDto {
  @IsDefined()
  foo?: string

  @IsOptional()
  @Min(10)
  bar?: number
}

describe('Validator', () => {
  let next: jest.Mock<NextFunction>
  const handler = validate<TestDto>(TestDto)

  beforeEach(() => {
    next = jest.fn()
  })

  async function handle(query: any = {}, params: any = {}) {
    await handler(
      // @ts-ignore
      {
        query,
        params,
      },
      { locals: {} },
      next
    )
  }

  it('throws a BadRequestException if the check does not pass', async () => {
    await handle()

    const exception = next.mock.calls[0][0] as HttpException
    expect(exception).toBeInstanceOf(BadRequestException)
    expect(exception.status).toBe(400)
  })

  it('throws an exception if required perperties are missing', async () => {
    await handle()

    expect(next).toBeCalledWith(
      new BadRequestException('foo should not be null or undefined')
    )
  })

  it('does not throw an exception if required properties are passed', async () => {
    await handle({ foo: '' })

    expect(next).toBeCalledWith()
  })

  test('class-validator decorators work', async () => {
    await handle({ foo: '', bar: '1' })

    expect(next).toBeCalledWith(
      new BadRequestException('bar must not be less than 10')
    )
  })

  test('catches all errors', async () => {
    const plainToClassSpy = jest
      .spyOn(ClassTransformer, 'plainToClass')
      .mockImplementation(() => {
        throw new Error('ohoh')
      })

    await handle({ foo: '' })
    expect(next).toBeCalledWith(new Error('ohoh'))

    plainToClassSpy.mockRestore()
  })
})
