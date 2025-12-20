import { firstValueFrom, Observable } from 'rxjs'
import { DomainError } from 'src/domain/errors/grpc-error'
import { Metadata, status } from '@grpc/grpc-js'
import type { ServiceError } from '@grpc/grpc-js'
export function grpcServiceProxy<T extends object>(service: T, tokenGenerator: () => string): T {
  return new Proxy(service, {
    get(target, prop) {
      const original = target[prop as keyof T]

      if (typeof original !== 'function') {
        return original
      }

      return async (...args: any[]) => {
        try {
          const result$ = original.apply(target,[...args, createAuthMetadata(tokenGenerator())]) as Observable<any>
          return await firstValueFrom(result$)
        } catch (error) {
          if (isGrpcServiceError(error)) {
            throw mapGrpcError(error)
          }
          throw error
        }
      }
    },
  })
}

function isGrpcServiceError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'number'
  )
}

export function mapGrpcError(err: unknown): DomainError {
  const error = err as ServiceError
  const [errorCode] = error.metadata.get('error-code')
  switch (error.code) {
    case status.NOT_FOUND:
      return new DomainError({
        type: 'not-found',
        code: String(errorCode),
        message: error.message,
      })
    case status.PERMISSION_DENIED:
      return new DomainError({
        type: 'forbidden',
        code: String(errorCode) || undefined,
        message: error.message,
      })
    default:
      return new DomainError({
        type: 'internal',
        code: String(errorCode) || undefined,
        message: error.message || 'Internal Server Error',
      })
  }
}

function createAuthMetadata(token: string) {
  const md = new Metadata()
  md.add(
    'authorization',
    `Bearer ${token}`
  )
  return md
}