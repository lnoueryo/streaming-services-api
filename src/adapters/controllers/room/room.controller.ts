import { Controller, Get, HttpException, Post, Query } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../shared/auth-user.decorator'
import { GetPublicRoomUseCase } from 'src/application/usecases/room/get-public-room.usecase'
import { Room } from 'src/domain/entities/room.entity'
import { CreateRoomUseCase } from 'src/application/usecases/room/create-room.usecase'
import { GetPublicRoomRequest } from './request/get-public-room.request'
import { GetPublicRoomResponse } from './response/get-public-room.response'
import { RoomResponse } from './response/room.response'

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
    @Query() params: GetPublicRoomRequest
    // @AuthUser() _: AuthUserRequest,
  ): Promise<GetPublicRoomResponse> {
    const result = await this.getPublicRoomUseCase.do(params)
    if ('error' in result) {
      throw  new HttpException(result.error.message, 500)
    }
    return new GetPublicRoomResponse(result.success)
  }
  @Post('/create')
  @ApiResponse({ status: 201, type: RoomResponse })
  async createRoom(
    // @AuthUser() user: AuthUserRequest,
  ): Promise<RoomResponse> {
    const result = await this.createRoomUseCase.do()
    if ('error' in result) {
      throw  new HttpException(result.error.message, 500)
    }
    return new RoomResponse(result.success)
  }
}
