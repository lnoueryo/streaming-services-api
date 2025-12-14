import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query
} from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { GetPublicSpaceUseCase } from 'src/application/usecases/space/get-public-space.usecase'
import { Space } from 'src/domain/entities/space.entity'
import { CreateSpaceUseCase } from 'src/application/usecases/space/create-space.usecase'
import { GetPublicSpaceRequest } from './request/get-public-space.request'
import { GetPublicSpaceResponse } from './response/get-public-space.response'
import { GetTargetSpaceResponse } from './response/get-target-space.response'
import { AuthUserRequest } from '../shared/auth.request'
import { EnterLobbyUseCase } from 'src/application/usecases/space/enter-lobby.usecase'
import { HttpErrorCodeException } from '../shared/http-exception'
import { EnableEntryUseCase } from 'src/application/usecases/space/enable-entry.usecase'
import { GetRoomResponse } from './response/get-room.response'

@ApiTags('spaces')
@Controller({
  path: 'spaces'
})
export class SpaceController {
  constructor(
    private readonly getPublicSpaceUseCase: GetPublicSpaceUseCase,
    private readonly createSpaceUseCase: CreateSpaceUseCase,
    private readonly enterLobbyUseCase: EnterLobbyUseCase,
    private readonly enableEntryUseCase: EnableEntryUseCase
  ) {}
  @Get('/public')
  @ApiResponse({ status: 200, type: Space })
  async getPublicSpaces(
    @Query() params: GetPublicSpaceRequest,
    @AuthUser() _: AuthUserRequest
  ): Promise<GetPublicSpaceResponse> {
    const result = await this.getPublicSpaceUseCase.do(params)
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetPublicSpaceResponse(result.success)
  }
  @Post('/create')
  @ApiResponse({ status: 201, type: GetTargetSpaceResponse })
  async createSpace(
    @AuthUser() _: AuthUserRequest
  ): Promise<GetTargetSpaceResponse> {
    const result = await this.createSpaceUseCase.do()
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetTargetSpaceResponse(result.success)
  }
  @Get('/:id/lobby')
  @ApiResponse({ status: 200, type: GetRoomResponse })
  async enterLobby(
    @Param('id') spaceId: string,
    @AuthUser() user: AuthUserRequest
  ): Promise<GetRoomResponse> {
    const result = await this.enterLobbyUseCase.do({ spaceId, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetRoomResponse(result.success)
  }
  @Patch('/:id/enable')
  @ApiResponse({ status: 200, type: GetRoomResponse })
  async enableEntry(
    @Param('id') spaceId: string,
    @AuthUser() user: AuthUserRequest,
    @Body() body: { force?: boolean }
  ): Promise<GetRoomResponse> {
    const result = await this.enableEntryUseCase.do({ spaceId, user, body })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetRoomResponse(result.success)
  }
}
