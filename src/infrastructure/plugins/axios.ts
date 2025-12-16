import axios, { AxiosRequestConfig, AxiosInstance } from 'axios'
import { CommonErrorCode, DomainError } from 'src/domain/errors/domain-error'

export const httpStatusToCommonErrorCodeMap = {
  400: 'validation',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not-found',
  409: 'conflict',
  429: 'too-many-requests',
  500: 'internal'
} as const

export function toCommonErrorCode(status: number): CommonErrorCode {
  return httpStatusToCommonErrorCodeMap[status] ?? 'internal'
}

export class AxiosFactory {
  static create(config: AxiosRequestConfig): AxiosInstance {
    const instance = axios.create(config)
    instance.interceptors.response.use(
      (res) => {
        if (res.status >= 400) {
          const status = res?.status ?? 0
          const message = res?.data?.message ?? ''
          const code = res?.data?.code ?? ''
          throw new DomainError({
            type: toCommonErrorCode(status),
            message,
            code
          })
        }
        return res
      },
      (error) => {
        throw error
      }
    )

    return instance
  }
}
