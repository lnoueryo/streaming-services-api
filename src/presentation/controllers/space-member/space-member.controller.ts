import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { AuthUserRequest } from '../shared/auth.request'
import { HttpErrorCodeException } from '../shared/http-exception'
import { RequestEntryUseCase } from 'src/application/usecases/space-member/request-entry.usecase'
import { DecideRequestRequest } from './request/decide-request.request'
import { DecideRequestUseCase } from 'src/application/usecases/space-member/decide-request.usecase'
import { DecideRequestResponse } from './response/decide-request.response'
import { GrpcMethod, RpcException } from '@nestjs/microservices'
import {
  GetTargetSpaceMemberRequest,
  GetTargetSpaceMemberResponse
} from 'src/proto/application'
import { GetTargetSpaceMemberUseCase } from 'src/application/usecases/space-member/get-target-space-member.usecase'
import { getGrpcStatus } from '../shared/grpc-status-mapper'
import { RequestEntryResponse } from './response/request-entry.response'
import { GetSpaceMemberResponse } from './response/get-space-members.response'
import { GetSpaceMemberUseCase } from 'src/application/usecases/space-member/get-space-member.usecase'
import { InviteSpaceMemberUseCase } from 'src/application/usecases/space-member/invite-space-member.usecase'

@ApiTags('space-members')
@Controller({
  path: 'space-members'
})
export class SpaceMemberController {
  constructor(
    private readonly getSpaceMemberUseCase: GetSpaceMemberUseCase,
    private readonly requestEntryUseCase: RequestEntryUseCase,
    private readonly decideRequestUseCase: DecideRequestUseCase,
    private readonly getTargetSpaceMemberUseCase: GetTargetSpaceMemberUseCase,
    private readonly inviteSpaceMembersUseCase: InviteSpaceMemberUseCase
  ) {}
  @Get('/:spaceId')
  @ApiResponse({ status: 200, type: GetSpaceMemberResponse })
  async getSpaceMembers(
    @Param('spaceId') spaceId: string,
    @AuthUser() user: AuthUserRequest
  ): Promise<GetSpaceMemberResponse> {
    const result = await this.getSpaceMemberUseCase.do({
      spaceId,
      userId: user.id
    })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetSpaceMemberResponse(result.success)
  }
  @Post('/:spaceId')
  @ApiResponse({ status: 200, type: GetSpaceMemberResponse })
  async inviteMembers(
    @Param('spaceId') spaceId: string,
    @AuthUser() user: AuthUserRequest,
    @Body() body: { members: { email: string, role: 'member' | 'admin' }[] }
  ): Promise<GetSpaceMemberResponse> {
    const result = await this.inviteSpaceMembersUseCase.do({
      spaceId,
      userId: user.id,
      members: body.members
    })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new GetSpaceMemberResponse(result.success)
  }
  @Patch('/:spaceId/request')
  @ApiResponse({ status: 200, type: RequestEntryResponse })
  async requestEntry(
    @Param('spaceId') spaceId: string,
    @AuthUser() user: AuthUserRequest
  ): Promise<RequestEntryResponse> {
    const result = await this.requestEntryUseCase.do({ spaceId, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new RequestEntryResponse(result.success)
  }
  @Patch('/:spaceId/request/:spaceMemberId/decide')
  @ApiResponse({ status: 200, type: DecideRequestResponse })
  async decideRequest(
    @Param('spaceId') spaceId: string,
    @Param('spaceMemberId') spaceMemberId: string,
    @Body() body: DecideRequestRequest,
    @AuthUser() user: AuthUserRequest
  ): Promise<DecideRequestResponse> {
    const result = await this.decideRequestUseCase.do({
      params: { spaceId, spaceMemberId },
      user,
      body
    })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return new DecideRequestResponse(result.success)
  }

  @GrpcMethod('SpaceService', 'GetTargetSpaceMember')
  async getSpaceMember(
    data: GetTargetSpaceMemberRequest
  ): Promise<GetTargetSpaceMemberResponse> {
    const result = await this.getTargetSpaceMemberUseCase.do({
      spaceId: data.spaceId,
      userId: data.userId
    })
    if ('error' in result) {
      throw new RpcException({
        message: result.error.message,
        code: getGrpcStatus(result.error.type)
      })
    }
    return result.success
  }
}
