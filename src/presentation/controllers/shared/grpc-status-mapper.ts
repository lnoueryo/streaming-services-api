import { CommonErrorCode } from '../../../domain/errors/domain-error'

export function getGrpcStatus(code: CommonErrorCode): number {
  const map: Record<CommonErrorCode, number> = {
    validation: 3,
    unauthorized: 16,
    forbidden: 7,
    'not-found': 5,
    conflict: 6,
    'too-many-requests': 8,
    internal: 13
  }
  return map[code] ?? 13
}
