import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { SpaceMember } from '@prisma/client'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { EntryRequestDecisionService } from 'src/domain/services/space-member/entry-request-decision.service'


type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class DecideRequestUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceMemberRepository))
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    private readonly entryRequestDecisionService: EntryRequestDecisionService
  ) {}
  async do(input: {
    params: { spaceId: string; spaceMemberId: number }
    user: { id: string; email: string }
    body: { status: 'approved' | 'rejected' }
  }): Promise<
    UseCaseResult<
      {
        id: number | undefined
        role: SpaceMember['role']
        status: SpaceMember['status']
      },
      ErrorType
    >
  > {
    try {
      const spaceMembers = await this.spaceMemberRepository.findMany({
        spaceId: input.params.spaceId
      })
      const actor = spaceMembers.find(
        (member) => member.userId === input.user.id
      )
      if (!actor) {
        return this.error('forbidden', 'あなたはスペースのメンバーではありません。')
      }
      const target = spaceMembers.find(
        (member) => member.id === input.params.spaceMemberId
      )
      if (!target) {
        return this.error('not-found', '対象のスペースメンバーが見つかりません。')
      }

      const spaceMember = this.entryRequestDecisionService.decide({
        actor,
        target,
        decision: input.body.status
      })
      await this.spaceMemberRepository.update(spaceMember)
      // TODO: gRPCでsignalingサーバーに参加リクエストを送信する
      return {
        success: {
          id: spaceMember.id,
          role: spaceMember.role,
          status: spaceMember.status
        }
      }
    } catch (error) {
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
