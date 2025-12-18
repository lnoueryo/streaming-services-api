export type CommonErrorCode =
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'internal'
  | 'not-found'
  | 'conflict'
  | 'too-many-requests'

export class DomainError extends Error {
  public type: string
  public message: string
  public code?: string
  constructor(params: { type: string; message: string; code?: string }) {
    super(params.message)
    this.type = params.type
    this.message = params.message
    this.code = params.code
  }
}
