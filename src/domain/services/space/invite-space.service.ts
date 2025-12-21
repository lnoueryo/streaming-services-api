import { Injectable } from '@nestjs/common'
import { Space } from 'src/domain/entities/space.entity'
import { DomainError } from 'src/domain/errors/domain-error'

type InvitePayload = {
  id: string
}

@Injectable()
export class InviteSpaceService {
  generate(space: Space): string {
    return Buffer.from(
      JSON.stringify({
        id: space.id
      })
    ).toString('base64url')
  }

  decode(hash: string): InvitePayload {
    try {
      const payload = JSON.parse(
        Buffer.from(hash, 'base64url').toString('utf8')
      )
      return {
        id: payload.id
      }
    } catch (error) {
      throw new DomainError({
        type: 'validation',
        message: 'invalid invite hash',
        code: 'invalid-hash'
      })
    }
  }
}
