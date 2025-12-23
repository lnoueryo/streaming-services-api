import { Inject, Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { DomainError } from 'src/domain/errors/domain-error'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import {
  MemberRole,
  MemberStatus
} from 'src/domain/entities/space-member.entity'

type ErrorType = 'forbidden' | 'conflict' | 'internal'

@Injectable()
export class RequestEntryUseCase {
  constructor(
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject(ISignalingGateway)
    private readonly signalingGateway: ISignalingGateway
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
      const updatedSpaceMember =
        await this.spaceMemberRepository.update(spaceMember)

      await this.signalingGateway.requestEntry({
        spaceId: input.spaceId,
        spaceMember: updatedSpaceMember
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
