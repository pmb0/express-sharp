import * as ClassValidator from 'class-validator'
import { IsDefined, IsOptional, Min } from 'class-validator'
import { NextFunction } from 'express'
import { ToNumber } from '../decorators'
import { BadRequestException, HttpException } from '../http-exception'
import { validate } from './validator.middleware'

class TestDto {
  @IsDefined()
  foo?: string

  @ToNumber()
  @IsOptional()
  @Min(10)
  bar?: number

  constructor(data: Partial<TestDto>) {
    Object.assign(this, data)
  }
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

  test('`error.constraints` might be missing', async () => {
    const validateSpy = jest
      .spyOn(ClassValidator, 'validate')
      .mockImplementation()
      .mockResolvedValue([{ property: 'bla', children: [] }])

    await handle({})

    expect(next).toBeCalledWith(new BadRequestException('Unknown error'))

    validateSpy.mockRestore()
  })

  test('class-validator decorators work', async () => {
    await handle({ foo: '', bar: '1' })

    expect(next).toBeCalledWith(
      new BadRequestException('bar must not be less than 10')
    )
  })

  it('catches all errors', async () => {
    const assignSpy = jest.spyOn(Object, 'assign').mockImplementation(() => {
      throw new Error('ohoh')
    })

    await handle({ foo: '' })
    expect(next).toBeCalledWith(new Error('ohoh'))

    assignSpy.mockRestore()
  })
})
