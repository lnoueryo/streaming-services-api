import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { EntryRequestDecisionService } from 'src/domain/services/space-member/entry-request-decision.service'

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
  }): Promise<UseCaseResult<true, 'forbidden' | 'not-found' | 'internal'>> {
    try {
      const spaceMembers = await this.spaceMemberRepository.findMany({
        spaceId: input.params.spaceId
      })
      const actor = spaceMembers.find(
        (member) => member.userId === input.user.id
      )
      if (!actor) {
        return {
          error: {
            type: 'forbidden',
            message: 'スペースのメンバーではありません。'
          }
        }
      }
      const target = spaceMembers.find(
        (member) => member.id === input.params.spaceMemberId
      )
      if (!target) {
        return {
          error: {
            type: 'not-found',
            message: '指定されたスペースメンバーが見つかりません。'
          }
        }
      }

      const spaceMember = this.entryRequestDecisionService.decide({
        actor,
        target,
        decision: input.body.status
      })
      await this.spaceMemberRepository.update(spaceMember)
      // gRPCでsignalingサーバーに参加リクエストを送信する
      return {
        success: true
      }
    } catch (error) {
      Logger.error(error)
      return {
        error: {
          type: 'internal',
          message: 'Internal Server Error'
        }
      }
    }
  }
}
