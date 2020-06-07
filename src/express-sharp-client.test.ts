import { createClient } from './express-sharp-client'

describe('ExpressSharpClient', () => {
  test('createClient()', () => {
    const client = createClient('https://example.com', 'test')

    expect(client.url('/foo.png', { width: 500 })).toBe(
      'https://example.com/foo.png?w=500&s=0ci9PRJaGqLjTlLJeBHmkjChQbu-fQdhtTL2wPZ8yVE'
    )
  })
})
