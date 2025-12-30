import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateSpaceRequest } from './request/create-space.request'
import { AcceptSpaceInviteUseCase } from 'src/application/usecases/space/accept-space-invite.usecase'
import { AcceptSpaceInviteResponse } from './response/accept-space-invite.response'
import { CreateSpaceResponse } from './response/create-space.response'
import { GetTargetSpaceUseCase } from 'src/application/usecases/space/get-target-space.usecase'
import { GetSpaceMemberResponse } from '../space-member/response/get-space-members.response'
import { InviteSpaceUseCase } from 'src/application/usecases/space/invite-space.usecase'

@ApiTags('spaces')
@Controller({
  path: 'spaces'
})
export class SpaceController {
  constructor(
    private readonly getPublicSpaceUseCase: GetPublicSpaceUseCase,
    private readonly createSpaceUseCase: CreateSpaceUseCase,
    private readonly acceptSpaceInviteUseCase: AcceptSpaceInviteUseCase,
    private readonly getTargetSpaceUseCase: GetTargetSpaceUseCase,
    private readonly enterLobbyUseCase: EnterLobbyUseCase,
    private readonly enableEntryUseCase: EnableEntryUseCase,
    private readonly inviteSpaceUseCase: InviteSpaceUseCase,
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
  @Post('/')
  @ApiResponse({ status: 201, type: CreateSpaceResponse })
  async createSpace(
    @Body() params: CreateSpaceRequest,
    @AuthUser() user: AuthUserRequest
  ): Promise<CreateSpaceResponse> {
    const result = await this.createSpaceUseCase.do({ body: params, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new CreateSpaceResponse(result.success)
  }
  @Get('/invite/:hash')
  @ApiResponse({ status: 200, type: AcceptSpaceInviteResponse })
  async acceptSpaceInvite(
    @Param('hash') hash: string,
    @AuthUser() user: AuthUserRequest
  ): Promise<AcceptSpaceInviteResponse> {
    const result = await this.acceptSpaceInviteUseCase.do({ hash, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new AcceptSpaceInviteResponse(result.success)
  }
  @Post('/invite/:spaceId')
  @ApiResponse({ status: 200, type: GetSpaceMemberResponse })
  async inviteMembers(
    @Param('spaceId') spaceId: string,
    @AuthUser() user: AuthUserRequest,
    @Body() body: { members: { email: string; role: 'member' | 'admin' }[] }
  ): Promise<GetSpaceMemberResponse> {
    const result = await this.inviteSpaceUseCase.do({
      spaceId,
      user,
      members: body.members
    })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetSpaceMemberResponse(result.success)
  }
  @Get('/:id')
  @ApiResponse({ status: 200, type: Space })
  async getTargetSpace(
    @Param() params: { id: string },
    @AuthUser() _: AuthUserRequest
    // TODO: admin only
  ): Promise<GetTargetSpaceResponse> {
    const result = await this.getTargetSpaceUseCase.do(params)
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
