export type CommonErrorCode =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'internal'
  | 'not-found'
  | 'too-many-requests'

export type UseCaseResult<T, U extends CommonErrorCode> =
  | {
      error: {
        type: U
        message: string
      }
    }
  | { success: T }
