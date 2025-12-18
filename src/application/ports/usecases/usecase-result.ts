import { CommonErrorCode } from '../../../domain/errors/domain-error'

export type UseCaseResult<T, U extends CommonErrorCode> =
  | {
      error: {
        type: U
        message: string
        errorCode?: string
      }
    }
  | { success: T }
