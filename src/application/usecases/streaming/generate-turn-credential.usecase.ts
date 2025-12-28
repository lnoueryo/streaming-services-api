import { Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { createHmac } from 'crypto'
import { GenerateTurnCredentialDto } from './dto/generate-turn-credential.dto'
import { config } from 'src/config'
@Injectable()
export class GenerateTurnCredentialUseCase {
  constructor() {}

  do(userId: string): UseCaseResult<GenerateTurnCredentialDto, 'internal'> {
    try {
      const ttl = config.turnServer.ttl
      const timestamp = Math.floor(Date.now() / 1000) + ttl
      const urls = config.turnServer.urls
      const username = `${timestamp}:${userId}`
      const hmac = createHmac('sha1', config.turnServer.secret)
      hmac.update(username)
      const password = hmac.digest('base64')

      return {
        success: new GenerateTurnCredentialDto({
          username,
          credential: password,
          ttl,
          urls,
        })
      }
    } catch (error) {
      Logger.error(error)
      return {
        error: {
          type: 'internal',
          message: 'Internal Server Error'
        }
      }
    }
  }
}
