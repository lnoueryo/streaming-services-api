import { Inject, Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { DomainError } from 'src/domain/errors/domain-error'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'

type ErrorType = 'forbidden' | 'internal'

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
  }): Promise<UseCaseResult<true, ErrorType>> {
    try {
      const spaceMember = await this.spaceMemberRepository.findByEmail({
        spaceId: input.spaceId,
        email: input.user.email
      })
      if (!spaceMember) {
        return this.error('forbidden', 'スペースのメンバーではありません。')
      }
      // TODO: approvedでリクエストの可能性があるので、こちらで返すステータスをフロントに反映させるべき。approvedをpendingで上書きする可能性あり
      spaceMember.requestEntry()
      const updatedSpaceMember =
        await this.spaceMemberRepository.update(spaceMember)

      await this.signalingGateway.requestEntry({
        spaceId: input.spaceId,
        spaceMember: {
          id: updatedSpaceMember.id!,
          spaceId: updatedSpaceMember.spaceId!,
          userId: updatedSpaceMember.userId!,
          email: updatedSpaceMember.email!,
          role: updatedSpaceMember.role,
          status: updatedSpaceMember.status
        }
      })
      return {
        success: true
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
