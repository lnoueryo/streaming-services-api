import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import output from 'src/config'
import { Space } from 'src/domain/entities/space.entity'
import { DomainError } from 'src/domain/errors/domain-error'
import { JwtFactory } from 'src/infrastructure/plugins/jwt'

type InvitePayload = {
  id: string
  exp: number
}

@Injectable()
export class InviteSpaceService {
  private readonly jwt: JwtService
  constructor(private readonly jwtFactory: JwtFactory) {
    this.jwt = this.jwtFactory.create(output.appSecret, { expiresIn: 14400 })
  }

  generate(space: Space): string {
    return this.jwt.sign({
      id: space.id
    })
  }

  decode(hash: string): InvitePayload {
    try {
      return this.jwt.verify<InvitePayload>(hash)
    } catch (error) {
      throw new DomainError({
        type: 'validation',
        message: 'invalid invite hash',
        code: 'invalid-hash'
      })
    }
  }
}
