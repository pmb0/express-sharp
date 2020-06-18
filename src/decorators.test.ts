import { Transform, ToNumber } from './decorators'

describe('Transform', () => {
  it('transforms properties', () => {
    class Test {
      @Transform(Number)
      foo!: string

      bar = '200'

      @ToNumber()
      baz!: any

      constructor(args: Partial<Test>) {
        Object.assign(this, args)
      }
    }

    const test = new Test({ foo: '100', bar: '300' })
    expect(test).toEqual({ foo: 100, bar: '300' })

    const test2 = new Test({ foo: '1100', bar: '300', baz: '200' })
    expect(test2).toEqual({ foo: 1100, bar: '300', baz: 200 })
  })
})
