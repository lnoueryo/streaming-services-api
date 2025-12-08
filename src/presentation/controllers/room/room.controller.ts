import { Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { GetPublicRoomUseCase } from 'src/application/usecases/room/get-public-room.usecase'
import { Room } from 'src/domain/entities/room.entity'
import { CreateRoomUseCase } from 'src/application/usecases/room/create-room.usecase'
import { GetPublicRoomRequest } from './request/get-public-room.request'
import { GetPublicRoomResponse } from './response/get-public-room.response'
import { GetTargetRoomResponse } from './response/get-target-room.response'
import { AuthUserRequest } from '../shared/auth.request'
import { EnterLobbyUseCase } from 'src/application/usecases/room/enter-lobby.usecase'
import { HttpErrorCodeException } from '../shared/http-exception'
import { RejoinRoomUseCase } from 'src/application/usecases/room/rejoin-room.usecase'
import { EnterLobbyResponse } from './response/enter-lobby.response'

@ApiTags('rooms')
@Controller({
  path: 'rooms',
})
export class RoomController {
  constructor(
    private readonly getPublicRoomUseCase: GetPublicRoomUseCase,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly enterLobbyUseCase: EnterLobbyUseCase,
    private readonly rejoinRoomUseCase: RejoinRoomUseCase,
  ) {}
  @Get('/public')
  @ApiResponse({ status: 200, type: Room })
  async getPublicRooms(
    @Query() params: GetPublicRoomRequest,
    @AuthUser() _: AuthUserRequest,
  ): Promise<GetPublicRoomResponse> {
    const result = await this.getPublicRoomUseCase.do(params)
    if ('error' in result) {
      throw  new HttpErrorCodeException(result.error)
    }
    return new GetPublicRoomResponse(result.success)
  }
  @Post('/create')
  @ApiResponse({ status: 201, type: GetTargetRoomResponse })
  async createRoom(
    @AuthUser() _: AuthUserRequest,
  ): Promise<GetTargetRoomResponse> {
    const result = await this.createRoomUseCase.do()
    if ('error' in result) {
      throw  new HttpErrorCodeException(result.error)
    }
    return new GetTargetRoomResponse(result.success)
  }
  @Put('/:id/join')
  @ApiResponse({ status: 200, type: GetTargetRoomResponse })
  async enterLobby(
    @Param('id') roomId: string,
    @AuthUser() user: AuthUserRequest,
  ): Promise<GetTargetRoomResponse> {
    const result = await this.enterLobbyUseCase.do({ roomId, user })
    if ('error' in result) {
      throw  new HttpErrorCodeException(result.error)
    }
    return new EnterLobbyResponse(result.success)
  }
  @Put('/:id/join/replace')
  @ApiResponse({ status: 200, type: GetTargetRoomResponse })
  async rejoinRoom(
    @Param('id') roomId: string,
    @AuthUser() user: AuthUserRequest,
  ): Promise<GetTargetRoomResponse> {
    const result = await this.rejoinRoomUseCase.do({ roomId, user })
    if ('error' in result) {
      throw  new HttpErrorCodeException(result.error)
    }
    return new GetTargetRoomResponse(result.success)
  }
}
