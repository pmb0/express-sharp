import _axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from 'axios'
import httpStatus from 'http-status'

let axiosConfig: AxiosRequestConfig = {}

export function setAxiosConfig(config: AxiosRequestConfig): void {
  axiosConfig = config
}

export const axios = _axios as jest.Mocked<AxiosStatic>

export function createAxiosResponse<T>(
  data: T,
  status = httpStatus.OK,
  config = axiosConfig,
): AxiosResponse<T> {
  const statusText = httpStatus[status] as string

  return {
    config,
    data,
    headers: {},
    status,
    statusText,
  }
}

export function mockNextResponse(
  data: unknown,
  status = httpStatus.OK,
  config = axiosConfig,
): void {
  axios.get.mockResolvedValueOnce(createAxiosResponse(data, status, config))
}

export function createAxiosError<T>(
  name: string,
  message: string,
  data: T,
  status = httpStatus.OK,
  config = axiosConfig,
): AxiosError<T> {
  const response: Omit<AxiosError, 'toJSON'> = {
    config,
    isAxiosError: true,
    message,
    name,
    response: createAxiosResponse(data, status, config),
  }

  return {
    ...response,
    toJSON: () => response,
  }
}

export function mockNextResponseAsError(
  name: string,
  message: string,
  data: unknown,
  status = httpStatus.OK,
  config = axiosConfig,
): void {
  axios.get.mockImplementation(() => {
    throw createAxiosError(name, message, data, status, config)
  })
}
