import { Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import output from 'src/config'

@Injectable()
export class ServiceJwtGenerator {
  constructor(private readonly jwt: JwtService) {}

  generate(config: {
    issuer: string
    audience: string
    subject?: string
    expiresIn: number
    additionalClaims?: Record<string, any>
  }): string {
    const options: JwtSignOptions = {
      issuer: config.issuer,
      audience: config.audience,
      subject: config.subject,
      expiresIn: config.expiresIn,
    }

    return this.jwt.sign(
      config.additionalClaims ?? {},
      {
        ...options,
        secret: output.signalingAuthJwt.secret,
      }
    )
  }
}