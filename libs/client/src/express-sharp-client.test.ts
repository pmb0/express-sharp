import { createClient } from './express-sharp-client'

describe('ExpressSharpClient', () => {
  test('createClient()', () => {
    const client = createClient(
      'https://example.com/my-express-sharp-endpoint',
      'test',
    )

    expect(client.url('/foo.png', { width: 500 })).toBe(
      'https://example.com/my-express-sharp-endpoint/foo.png?w=500&s=Of3ty8QY-NDhCsIrgIHvPvbokkDcxV8KtaYUB4NFRd8',
    )
  })
})
