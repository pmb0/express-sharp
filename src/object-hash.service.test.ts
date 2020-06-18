import { container } from 'tsyringe'
import { ConfigService } from './config.service'
import { ToNumber, Transform } from './decorators'
import { ObjectHash } from './object-hash.service'

describe('ObjectHash', () => {
  let config: ConfigService
  let hasher: ObjectHash

  beforeEach(() => {
    config = container.resolve(ConfigService)
    hasher = container.resolve(ObjectHash)
  })

  afterEach(() => {
    container.clearInstances()
  })

  describe('stringify()', () => {
    it('should sort properties', () => {
      expect(hasher.stringify({ z: 'z', a: 'a' })).toBe('{"a":"a","z":"z"}')
    })

    it('should stringify all enumerable properties', () => {
      const object = { c: 'c', bar: undefined }
      Object.defineProperties(object, {
        foo: {
          get: () => 'foo',
        },
        bar: {
          get: () => 'bar',
          enumerable: true,
        },
      })

      expect(hasher.stringify(object)).toBe('{"bar":"bar","c":"c"}')
    })

    it('should stringify classes', () => {
      class Foo {
        foo = 'bar'
      }
      const foo = new Foo()
      Object.defineProperty(foo, 'bar', {
        get: () => 'bar',
        enumerable: true,
      })

      expect(hasher.stringify(foo)).toBe('{"bar":"bar","foo":"bar"}')
    })

    it('should stringify decorated/transformed class properties', () => {
      class Foo {
        @Transform(Number)
        foo?: number

        @Transform(Number)
        bar = 10

        @ToNumber()
        baz? = '30'

        c = 'c'
      }

      const foo = new Foo()
      // @ts-ignore
      foo.foo = '20'

      expect(hasher.stringify(foo)).toBe('{"bar":10,"baz":30,"c":"c","foo":20}')
    })
  })

  describe('hash()', () => {
    it('should create a default length hash', () => {
      expect(hasher.hash({ foo: true })).toBe('ce35fd691f')
    })

    it('should create a 5 chars hash', () => {
      config.set('objectHash.hashLength', '5')
      expect(hasher.hash({ foo: true })).toHaveLength(5)
    })
  })
})
