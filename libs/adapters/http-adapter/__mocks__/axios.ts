import { AxiosStatic } from 'axios'

const original = jest.requireActual<AxiosStatic>('axios')

const mockAxios = jest.createMockFromModule<AxiosStatic>('axios')

// this is the key to fix the axios.create() undefined error!
mockAxios.create = jest.fn(() => mockAxios)

// eslint-disable-next-line @typescript-eslint/unbound-method
mockAxios.isAxiosError = original.isAxiosError

export default mockAxios
