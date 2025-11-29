import { Controller, HttpException, Post } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { Room } from 'src/domain/entities/room.entity'
import { AuthUserRequest } from '../shared/auth.request'
import { GenerateTurnCredentialUseCase } from 'src/application/usecases/streaming/generate-turn-credential.usecase'
import { getHttpStatus } from '../shared/http-status-mapper'
import { GenerateTurnCredentialResponse } from './response/generate-turn-credential.response'

@ApiTags('streaming')
@Controller({
  path: 'streaming',
})
export class StreamingController {
  constructor(
    private readonly generateTurnCredentialUseCase: GenerateTurnCredentialUseCase,
  ) {}
  @Post('/turn/generate')
  @ApiResponse({ status: 200, type: Room })
  async generateTurnCredentials(
    @AuthUser() user: AuthUserRequest
  ) {
    const result = this.generateTurnCredentialUseCase.do(user.id)
    if ('error' in result) {
      throw  new HttpException(result.error.message, getHttpStatus(result.error.type))
    }
    return new GenerateTurnCredentialResponse(result.success)
  }
}
