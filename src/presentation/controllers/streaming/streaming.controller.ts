import { Controller, Delete, Get, Param, Post, Response } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { AuthUserRequest } from '../shared/auth.request'
import { GenerateTurnCredentialUseCase } from 'src/application/usecases/streaming/generate-turn-credential.usecase'
import { GenerateTurnCredentialResponse } from './response/generate-turn-credential.response'
import { HttpErrorCodeException } from '../shared/http-exception'
import { GetVideoUseCase } from 'src/application/usecases/streaming/get-video.usecase'
import { GetVideoResponse } from './response/get-video.response'
import { GetTargetVideoUseCase } from 'src/application/usecases/streaming/get-target-video.usecase'
import { DeleteTargetVideoUseCase } from 'src/application/usecases/streaming/delete-target-video.usecase'

@ApiTags('streaming')
@Controller({
  path: 'streaming'
})
export class StreamingController {
  constructor(
    private readonly generateTurnCredentialUseCase: GenerateTurnCredentialUseCase,
    private readonly getVideoUseCase: GetVideoUseCase,
    private readonly getTargetVideoUseCase: GetTargetVideoUseCase,
    private readonly deleteTargetVideoUseCase: DeleteTargetVideoUseCase
  ) {}
  @Post('/turn/generate')
  @ApiResponse({ status: 200, type: GenerateTurnCredentialResponse })
  async generateTurnCredentials(
    @AuthUser() user: AuthUserRequest
  ): Promise<GenerateTurnCredentialResponse> {
    const result = this.generateTurnCredentialUseCase.do(user.id)
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GenerateTurnCredentialResponse(result.success)
  }
  @Get('/space/:id')
  @ApiResponse({ status: 200, type: GetVideoResponse })
  async getVideos(
    @AuthUser() user: AuthUserRequest,
    @Param('id') roomId: string
  ): Promise<GetVideoResponse> {
    const result = await this.getVideoUseCase.do({ roomId, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetVideoResponse(result.success)
  }
  @Get('/space/:id/:recordingId/:filename')
  @ApiResponse({ status: 200 })
  async getTargetVideo(
    @AuthUser() user: AuthUserRequest,
    @Param('id') roomId: string,
    @Param('recordingId') recordingId: string,
    @Param('filename') filename: string,
    @Response() res: any
  ) {
    const result = await this.getTargetVideoUseCase.do({
      roomId,
      recordingId,
      filename,
      user
    })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return await res.sendFile(result.success.path)
  }
  @Delete('/space/:id/:recordingId')
  @ApiResponse({ status: 204 })
  async deleteTargetVideo(
    @AuthUser() user: AuthUserRequest,
    @Param('id') roomId: string,
    @Param('recordingId') recordingId: string
  ): Promise<void> {
    const result = await this.deleteTargetVideoUseCase.do({
      roomId,
      recordingId,
      user
    })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return
  }
}
