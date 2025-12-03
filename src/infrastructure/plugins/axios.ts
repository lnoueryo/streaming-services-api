import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { CommonErrorCode, UseCaseError } from 'src/application/ports/usecases/usecase-error';

export const httpStatusToCommonErrorCodeMap = {
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  404: "not-found",
  409: "conflict",
  429: "too-many-requests",
  500: "internal",
} as const;

export function toCommonErrorCode(status: number): CommonErrorCode {
  return httpStatusToCommonErrorCodeMap[status] ?? 'internal';
}

export class AxiosFactory {
  static create(config: AxiosRequestConfig): AxiosInstance {
    const instance = axios.create(config);
    instance.interceptors.response.use(
      res => res,
      (error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 0;
          const message = error.response?.data?.message ?? error.message;
          throw new UseCaseError({
            type: toCommonErrorCode(status),
            message,
            code: error.code,
          });
        }
        throw error;
      }
    );

    return instance;
  }
}