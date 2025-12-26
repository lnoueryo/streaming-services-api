import { Inject, Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { DomainError } from 'src/domain/errors/domain-error'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import {
  MemberRole,
  MemberStatus
} from 'src/domain/entities/space-member.entity'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

type ErrorType = 'forbidden' | 'conflict' | 'internal'

@Injectable()
export class RequestEntryUseCase {
  constructor(
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject(IMediaGateway)
    private readonly mediaGateway: IMediaGateway,
    private readonly prisma: PrismaService
  ) {}
  async do(input: {
    spaceId: string
    user: { id: string; email: string }
  }): Promise<
    UseCaseResult<
      {
        role: MemberRole
        status: MemberStatus
      },
      ErrorType
    >
  > {
    try {
      const spaceMember = await this.spaceMemberRepository.findByEmail({
        spaceId: input.spaceId,
        email: input.user.email
      })
      if (!spaceMember) {
        return this.error('forbidden', 'スペースのメンバーではありません。')
      }
      try {
        spaceMember.requestEntry()
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'invalid-status') {
            return {
              success: {
                role: spaceMember.role,
                status: spaceMember.status
              }
            }
          }
          throw error
        }
      }
      const updatedSpaceMember = await this.prisma.$transaction(async (tx) => {
        const spaceMemberRepository = this.spaceMemberRepository.transaction(tx)
        const updatedSpaceMember =
          await spaceMemberRepository.update(spaceMember)
        try {
          await this.mediaGateway.requestEntry({
            spaceId: input.spaceId,
            spaceMember: updatedSpaceMember
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
        return updatedSpaceMember
      })

      return {
        success: {
          role: updatedSpaceMember.role,
          status: updatedSpaceMember.status
        }
      }
    } catch (error) {
      if (error instanceof DomainError) {
        if (error.code === 'member-rejected') {
          return this.error('forbidden', 'ルームへの参加が拒否されています。')
        }
      }
      Logger.error(error)
      return this.error('internal', 'Internal Server Error')
    }
  }
  private error(type: ErrorType, message: string) {
    return {
      error: {
        type,
        message
      }
    }
  }
}
