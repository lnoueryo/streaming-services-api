import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Space } from 'src/domain/entities/space.entity'

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
    return this.jwtService.verify<InvitePayload>(hash)
  }
}
