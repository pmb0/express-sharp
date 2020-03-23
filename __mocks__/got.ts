export default class GotMock {
  static extend = jest.fn().mockReturnValue(new GotMock())

  defaults = {
    options: {},
  }

  get = jest.fn().mockReturnValue({ body: Buffer.from('test') })
}
