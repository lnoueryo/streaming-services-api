import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { Space } from 'src/domain/entities/space.entity'

type AcceptSpaceInviteUseCaseResult = {
  redirect: string
  space: {
    id: string
    name?: string
    privacy: string
  }
}

type ErrorType = 'not-found' | 'forbidden' | 'internal'
@Injectable()
export class AcceptSpaceInviteUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository,
    @Inject(forwardRef(() => ISpaceMemberRepository))
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject('InviteSpaceService')
    private readonly inviteSpaceService: InviteSpaceService
  ) {}

  async do(params: {
    user: { id: string; email: string }
    hash: string
  }): Promise<UseCaseResult<AcceptSpaceInviteUseCaseResult, ErrorType>> {
    try {
      // TODO : inviteの有効期限有無、チェック、decodeエラーの処理を実装する
      const spaceInvite = this.inviteSpaceService.decode(params.hash)
      const space = await this.spaceRepository.findSpace(spaceInvite.id)
      if (!space) {
        return this.error('not-found', 'スペースが見つかりません')
      }
      if (!space.canAccept(params.user.email)) {
        return this.error('forbidden', 'スペースに参加する権限がありません')
      }
      if (space.isPublic()) {
        return this.success(space)
      } else if (space.isProtected()) {
        const { invitedMember, newMember } = space.joinProtected(
          params.user.id,
          params.user.email
        )
        if (invitedMember) {
          await this.spaceMemberRepository.update(invitedMember)
        }
        if (newMember) {
          await this.spaceMemberRepository.create(newMember)
        }

        return this.success(space)
      } else if (space.isPrivate()) {
        const { invitedMember } = space.joinPrivate(
          params.user.id,
          params.user.email
        )
        if (invitedMember) {
          await this.spaceMemberRepository.update(invitedMember)
        }
        return this.success(space)
      }
    } catch (error) {
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
