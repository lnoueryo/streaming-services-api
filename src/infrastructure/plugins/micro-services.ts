import { firstValueFrom, Observable } from 'rxjs'
import { DomainError } from 'src/domain/errors/domain-error'
import { Metadata, status } from '@grpc/grpc-js'
import type { ServiceError } from '@grpc/grpc-js'
import {
  ClientGrpc,
  ClientOptions,
  ClientProxyFactory,
  Transport
} from '@nestjs/microservices'
import { Injectable } from '@nestjs/common'
import { JwtFactory } from './jwt'
import { JwtService } from '@nestjs/jwt'
import { config } from 'src/config'

@Injectable()
export class GrpcClientFactory {
  private readonly jwt: JwtService

  constructor(jwtFactory: JwtFactory) {
    this.jwt = jwtFactory.create(config.signalingAuthJwt.secret, {
      expiresIn: config.signalingAuthJwt.config.expiresIn
    })
  }
  create<T extends object>(options: {
    url: string
    protoPath: string
    package: string
    serviceName: string
  }): T {
    const clientOptions: ClientOptions = {
      transport: Transport.GRPC,
      options: {
        url: options.url,
        package: options.package,
        protoPath: options.protoPath,
        loader: {
          defaults: true,
          arrays: true
        }
      }
    }

    const client: ClientGrpc = ClientProxyFactory.create(clientOptions) as any
    return this.grpcServiceProxy(client.getService<T>(options.serviceName))
  }

  private grpcServiceProxy<T extends object>(service: T): T {
    const factory = this
    return new Proxy(service, {
      get(target, prop) {
        const original = target[prop as keyof T]

        if (typeof original !== 'function') {
          return original
        }

        return async (...args: any[]) => {
          try {
            const result$ = original.apply(target, [
              ...args,
              factory.createAuthMetadata()
            ]) as Observable<any>
            return await firstValueFrom(result$)
          } catch (error) {
            if (factory.isGrpcServiceError(error)) {
              throw factory.mapGrpcError(error)
            }
            throw error
          }
        }
      }
    })
  }

  private isGrpcServiceError(error: unknown): error is { code: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as any).code === 'number'
    )
  }

  private mapGrpcError(err: unknown): DomainError {
    const error = err as ServiceError
    const errorCode = error.metadata.get('error-code')?.[0]
    switch (error.code) {
      case status.NOT_FOUND:
        return new DomainError({
          type: 'not-found',
          code: String(errorCode) || undefined,
          message: error.details
        })
      case status.PERMISSION_DENIED:
        return new DomainError({
          type: 'forbidden',
          code: String(errorCode) || undefined,
          message: error.details
        })
      default:
        return new DomainError({
          type: 'internal',
          code: String(errorCode) || undefined,
          message: error.details || 'Internal Server Error'
        })
    }
  }

  private createAuthMetadata(): Metadata {
    const md = new Metadata()
    const token = this.jwt.sign(
      {},
      {
        issuer: config.signalingAuthJwt.config.issuer,
        subject: config.signalingAuthJwt.config.subject,
        audience: config.signalingAuthJwt.config.audience
      }
    )
    md.add('authorization', `Bearer ${token}`)
    return md
  }
}
