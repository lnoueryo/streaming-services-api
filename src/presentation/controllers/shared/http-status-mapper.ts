import { CommonErrorCode } from '../../../application/ports/usecases/usecase-result'


export function getHttpStatus(code: CommonErrorCode): number {
  const commonErrorCodeToHttpStatusMap: Record<CommonErrorCode, number> = {
    'validation': 400,
    'unauthorized': 401,
    'forbidden': 403,
    'not-found': 404,
    'too-many-requests': 429,
    'internal': 500,
  }
  return commonErrorCodeToHttpStatusMap[code] || 500
}