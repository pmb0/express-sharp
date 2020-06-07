import { camelToSnake } from './util'

test('camelToSnake()', () => {
  expect(camelToSnake('fooBar_Baz')).toBe('foo_bar__baz')
})
