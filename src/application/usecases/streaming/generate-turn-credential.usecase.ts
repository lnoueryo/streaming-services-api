import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { createHmac } from 'crypto'
import output from 'src/config'
import { GenerateTurnCredentialDto } from './dto/generate-turn-credential.dto'
@Injectable()
export class GenerateTurnCredentialUseCase {
  constructor() {}

  do(userId: string): UseCaseResult<GenerateTurnCredentialDto, 'internal'> {
    try {
    const ttl = output.ttl
    const timestamp = Math.floor(Date.now() / 1000) + ttl
    const username = `${timestamp}:${userId}`
    const hmac = createHmac("sha1", output.turnServerSecret)
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
