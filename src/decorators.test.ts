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

    const test = new Test({ bar: '300', foo: '100' })
    expect(test).toEqual({ bar: '300', foo: 100 })

    const test2 = new Test({ bar: '300', baz: '200', foo: '1100' })
    expect(test2).toEqual({ bar: '300', baz: 200, foo: 1100 })
  })
})
