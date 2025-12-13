import { Controller, Post } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { AuthUserRequest } from '../shared/auth.request'
import { GenerateTurnCredentialUseCase } from 'src/application/usecases/streaming/generate-turn-credential.usecase'
import { GenerateTurnCredentialResponse } from './response/generate-turn-credential.response'
import { HttpErrorCodeException } from '../shared/http-exception'

@ApiTags('streaming')
@Controller({
  path: 'streaming'
})
export class StreamingController {
  constructor(
    private readonly generateTurnCredentialUseCase: GenerateTurnCredentialUseCase
  ) {}
  @Post('/turn/generate')
  @ApiResponse({ status: 200, type: GenerateTurnCredentialResponse })
  async generateTurnCredentials(@AuthUser() user: AuthUserRequest) {
    const result = this.generateTurnCredentialUseCase.do(user.id)
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GenerateTurnCredentialResponse(result.success)
  }
}
