import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Space } from 'src/domain/entities/space.entity'
import { DomainError } from 'src/domain/errors/domain-error'

type InvitePayload = {
  id: string
  exp: number
}

@Injectable()
export class InviteSpaceService {
  constructor(private readonly jwtService: JwtService) {}

  generate(space: Space): string {
    return this.jwtService.sign({
      id: space.id
    })
  }

  decode(hash: string): InvitePayload {
    try {
      return this.jwtService.verify<InvitePayload>(hash)
    } catch (error) {
      throw new DomainError({
        type: 'validation',
        message: 'invalid invite hash',
        code: 'invalid-hash'
      })
    }
  }
}
