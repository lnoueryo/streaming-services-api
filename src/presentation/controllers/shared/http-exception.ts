import { HttpException } from '@nestjs/common'
import { getHttpStatus } from './http-status-mapper'
import { CommonErrorCode } from 'src/domain/errors/domain-error'

export class HttpErrorCodeException extends HttpException {
  constructor(params: {
    type: CommonErrorCode
    message: string
    errorCode?: string
  }) {
    const { message, type, errorCode } = params
    const statusCode = getHttpStatus(type)
    super({ message, statusCode, errorCode }, statusCode)
  }
}
