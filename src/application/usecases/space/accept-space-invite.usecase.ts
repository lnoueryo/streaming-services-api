import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { Space } from 'src/domain/entities/space.entity'
import { DomainError } from 'src/domain/errors/domain-error'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

type AcceptSpaceInviteUseCaseResult = {
  redirect: string
  space: {
    id: string
    name?: string
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
    private readonly inviteSpaceService: InviteSpaceService,
    @Inject(IMediaGateway)
    private readonly mediaGateway: IMediaGateway,
    private readonly prisma: PrismaService
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
          await this.prisma.$transaction(async (tx) => {
            const spaceMemberRepository =
              this.spaceMemberRepository.transaction(tx)
            await spaceMemberRepository.upsert(spaceMember)
            try {
              await this.mediaGateway.changeMemberState({
                spaceId: space.id,
                spaceMember
              })
            } catch (error) {
              if (error instanceof DomainError === false) {
                throw error
              }
              if (error.type !== 'not-found') {
                throw error
              }
              // not-foundならまだ誰も参加していないだけなのでスルー
            }
          })
        }
        return this.success(space)
      } else if (space.isPrivate()) {
        const spaceMember = space.allowMemberToAcceptPrivateInvitation(
          params.user.id,
          params.user.email
        )
        if (spaceMember) {
          await this.prisma.$transaction(async (tx) => {
            const spaceMemberRepository =
              this.spaceMemberRepository.transaction(tx)
            await spaceMemberRepository.upsert(spaceMember)
            try {
              await this.mediaGateway.changeMemberState({
                spaceId: space.id,
                spaceMember
              })
            } catch (error) {
              if (error instanceof DomainError === false) {
                throw error
              }
              if (error.type !== 'not-found') {
                throw error
              }
            }
          })
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
          name: space.name || undefined,
          privacy: space.privacy
        },
        redirect: `/space/${space.id}`
      }
    }
  }

  private error(type: ErrorType, message: string) {
    return { error: { type, message } }
  }
}
