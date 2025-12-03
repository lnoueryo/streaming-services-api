import { Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { createHmac } from 'crypto'
import { GenerateTurnCredentialDto } from './dto/generate-turn-credential.dto'
import config from 'src/config';
@Injectable()
export class GenerateTurnCredentialUseCase {
  constructor() {}

  do(userId: string): UseCaseResult<GenerateTurnCredentialDto, 'internal'> {
    try {
    const ttl = config.ttl
    const timestamp = Math.floor(Date.now() / 1000) + ttl
    const username = `${timestamp}:${userId}`
    const hmac = createHmac("sha1", config.turnServerSecret)
    hmac.update(username)
    const password = hmac.digest("base64")

      return {
        success: new GenerateTurnCredentialDto({
          username,
          credential: password,
          ttl,
          urls: [
            "turn:turn.jounetsism.biz:3478?transport=udp",
            "turn:turn.jounetsism.biz:3478?transport=tcp",
            "turns:turn.jounetsism.biz:5349?transport=tcp",
          ],
        })
      }
    } catch (error) {
      Logger.error(error)
      return {
        error: {
          type: 'internal',
          message: 'Internal Server Error',
        }
      }
    }
  }
}
