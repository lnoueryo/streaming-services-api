import { Controller, Get, HttpException, Post, Query } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { GetPublicRoomUseCase } from 'src/application/usecases/room/get-public-room.usecase'
import { Room } from 'src/domain/entities/room.entity'
import { CreateRoomUseCase } from 'src/application/usecases/room/create-room.usecase'
import { GetPublicRoomRequest } from './request/get-public-room.request'
import { GetPublicRoomResponse } from './response/get-public-room.response'
import { GetTargetRoomResponse } from './response/get-target-room.response'
import { getHttpStatus } from '../shared/http-status-mapper'
import { AuthUserRequest } from '../shared/auth.request'

@ApiTags('rooms')
@Controller({
  path: 'rooms',
})
export class RoomController {
  constructor(
    private readonly getPublicRoomUseCase: GetPublicRoomUseCase,
    private readonly createRoomUseCase: CreateRoomUseCase,
  ) {}
  @Get('/public')
  @ApiResponse({ status: 200, type: Room })
  async getPublicRooms(
    @Query() params: GetPublicRoomRequest,
    @AuthUser() _: AuthUserRequest,
  ): Promise<GetPublicRoomResponse> {
    const result = await this.getPublicRoomUseCase.do(params)
    if ('error' in result) {
      throw  new HttpException(result.error.message, getHttpStatus(result.error.type))
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
      throw  new HttpException(result.error.message, getHttpStatus(result.error.type))
    }
    return new GetTargetRoomResponse(result.success)
  }
}
