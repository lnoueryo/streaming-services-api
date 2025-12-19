import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { AuthUserRequest } from '../shared/auth.request'
import { HttpErrorCodeException } from '../shared/http-exception'
import { RequestEntryUseCase } from 'src/application/usecases/space-member/request-entry.usecase'
import { DecideRequestRequest } from './request/decide-request.request'
import { DecideRequestUseCase } from 'src/application/usecases/space-member/decide-request.usecase'
import { DecideRequestResponse } from './response/decide-request.response'

@ApiTags('space-members')
@Controller({
  path: 'space-members'
})
export class SpaceMemberController {
  constructor(
    private readonly requestEntryUseCase: RequestEntryUseCase,
    private readonly decideRequestUseCase: DecideRequestUseCase
  ) {}
  @Patch('/:spaceId/request')
  @ApiResponse({ status: 200, type: Boolean })
  async requestEntry(
    @Param('spaceId') spaceId: string,
    @AuthUser() user: AuthUserRequest
  ): Promise<true> {
    const result = await this.requestEntryUseCase.do({ spaceId, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
    return true
  }
  @Patch('/:spaceId/request/:spaceMemberId/decide')
  @ApiResponse({ status: 200, type: DecideRequestResponse })
  async decideRequest(
    @Param('spaceId') spaceId: string,
    @Param('spaceMemberId', ParseIntPipe) spaceMemberId: number,
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
}
