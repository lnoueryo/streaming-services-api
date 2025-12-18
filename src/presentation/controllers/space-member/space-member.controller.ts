import {
  Body,
  Controller,
  Param,
  Patch,
} from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { AuthUser } from '../../interceptors/auth-user.decorator'
import { Space } from 'src/domain/entities/space.entity'
import { AuthUserRequest } from '../shared/auth.request'
import { HttpErrorCodeException } from '../shared/http-exception'
import { RequestEntryUseCase } from 'src/application/usecases/space-member/request-entry.usecase'
import { DecideRequestRequest } from './request/decide-request.request'
import { DecideRequestUseCase } from 'src/application/usecases/space-member/decide-request.usecase'

@ApiTags('space-members')
@Controller({
  path: 'space-members'
})
export class SpaceController {
  constructor(
    private readonly requestEntryUseCase: RequestEntryUseCase,
    private readonly decideRequestUseCase: DecideRequestUseCase
  ) {}
  @Patch('/:spaceId/request')
  @ApiResponse({ status: 200, type: Space })
  async requestEntry(
    @Param('spaceId') spaceId: string,
    @AuthUser() user: AuthUserRequest
  ): Promise<void> {
    const result = await this.requestEntryUseCase.do({ spaceId, user })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
  }
  @Patch('/:spaceId/request/:spaceMemberId')
  @ApiResponse({ status: 200, type: Space })
  async decideRequest(
    @Param()
    params: {
      spaceId: string
      spaceMemberId: number
    },
    @Body() body: DecideRequestRequest,
    @AuthUser() user: AuthUserRequest
  ): Promise<void> {
    const result = await this.decideRequestUseCase.do({ params, user, body })
    if ('error' in result) {
      throw new HttpErrorCodeException(result.error)
    }
  }
}
