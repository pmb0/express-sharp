import { ConfigService } from './config.service'
import { container } from 'tsyringe'

describe('ConfigService', () => {
  let config: ConfigService

  beforeEach(() => {
    config = container.resolve(ConfigService)
  })

  afterEach(() => {
    container.clearInstances()
  })

  describe('get()', () => {
    it('reads config var from env', () => {
      process.env.EXPRESS_SHARP_foo = 'baz'

      expect(config.get('foo')).toBe('baz')
      expect(config.get('foo', 'bar')).toBe('baz')

      delete process.env.EXPRESS_SHARP_foo
    })

    it('unknown keys are undefined', () => {
      expect(config.get('foo')).toBeUndefined()
    })

    it('supports a default value', () => {
      expect(config.get('foo', 'bar')).toBe('bar')
    })
  })
})
