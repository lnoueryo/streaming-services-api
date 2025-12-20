import { Injectable } from '@nestjs/common'
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

export function toCommonErrorCode(
  status: keyof typeof httpStatusToCommonErrorCodeMap
): CommonErrorCode {
  return httpStatusToCommonErrorCodeMap[status] ?? 'internal'
}

@Injectable()
export class AxiosFactory {
  create(config: AxiosRequestConfig): AxiosInstance {
    const instance = axios.create(config)
    instance.interceptors.response.use(
      (res) => {
        return res
      },
      (error) => {
        if (error.response.status >= 400) {
          const status = error.response?.status ?? 0
          const message = error.response?.data?.message ?? ''
          const code = error.response?.data?.code ?? ''
          throw new DomainError({
            type: toCommonErrorCode(status),
            message,
            code
          })
        }
        throw error
      }
    )

    return instance
  }
}
