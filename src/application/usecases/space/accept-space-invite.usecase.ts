import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { Space } from 'src/domain/entities/space.entity'
import { DomainError } from 'src/domain/errors/domain-error'

type AcceptSpaceInviteUseCaseResult = {
  redirect: string
  space: {
    id: string
    name?: string | null
    privacy: string
  }
}

type ErrorType = 'validation' | 'not-found' | 'forbidden' | 'internal'
@Injectable()
export class AcceptSpaceInviteUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository,
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject(InviteSpaceService)
    private readonly inviteSpaceService: InviteSpaceService
  ) {}

  async do(params: {
    user: { id: string; email: string }
    hash: string
  }): Promise<UseCaseResult<AcceptSpaceInviteUseCaseResult, ErrorType>> {
    try {
      const spaceInvite = this.inviteSpaceService.decode(params.hash)
      const space = await this.spaceRepository.findSpace(spaceInvite.id)
      if (!space) {
        return this.error('not-found', 'スペースが見つかりません')
      }

      if (space.isPublic()) {
        return this.success(space)
      } else if (space.isProtected()) {
        const spaceMember = space.allowMemberToAcceptProtectedInvitation(
          params.user.id,
          params.user.email
        )
        if (spaceMember) {
          await this.spaceMemberRepository.upsert(spaceMember)
        }

        return this.success(space)
      } else if (space.isPrivate()) {
        const spaceMember = space.allowMemberToAcceptPrivateInvitation(
          params.user.id,
          params.user.email
        )
        if (spaceMember) {
          await this.spaceMemberRepository.upsert(spaceMember)
        }
        return this.success(space)
      }
      return this.error('internal', 'サーバーエラーが発生しました')
    } catch (error) {
      if (error instanceof DomainError) {
        if (error.type === 'validation') {
          return this.error('validation', '無効な招待リンクです')
        }
        if (error.type === 'forbidden') {
          return this.error('forbidden', 'スペースに参加する権限がありません')
        }
      }
      Logger.error(error)
      return this.error('internal', 'サーバーエラーが発生しました')
    }
  }
  private success(space: Space) {
    return {
      success: {
        space: {
          id: space.id,
          name: space.name,
          privacy: space.privacy
        },
        redirect: `/spaces/${space.id}`
      }
    }
  }

  private error(type: ErrorType, message: string) {
    return { error: { type, message } }
  }
}
