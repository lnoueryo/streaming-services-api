import { Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'

@Injectable()
export class JwtFactory {
  create(secret: string, signOptions: JwtSignOptions) {
    return new JwtService({
      secret,
      signOptions,
    })
  }
}