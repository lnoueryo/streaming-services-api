import { Inject, Injectable, Logger } from '@nestjs/common'
import { SpaceMember } from '@prisma/client'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { SpaceUser } from 'src/domain/entities/space-user.entity'
import { EntryRequestDecisionService } from 'src/domain/services/space-member/entry-request-decision.service'
import { auth } from 'src/infrastructure/plugins/firebase-admin'

type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class DecideRequestUseCase {
  constructor(
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject(EntryRequestDecisionService)
    private readonly entryRequestDecisionService: EntryRequestDecisionService,
    @Inject(ISignalingGateway)
    private readonly signalingGateway: ISignalingGateway,
    @Inject(IMediaGateway)
    private readonly mediaGateway: IMediaGateway
  ) {}
  async do(input: {
    params: { spaceId: string; spaceMemberId: string }
    user: { id: string; email: string }
    body: { status: 'none' | 'approved' | 'rejected' }
  }): Promise<
    UseCaseResult<
      {
        id: string
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
        return this.error(
          'forbidden',
          'あなたはスペースのメンバーではありません。'
        )
      }
      const target = spaceMembers.find(
        (member) => member.id === input.params.spaceMemberId
      )
      if (!target) {
        return this.error(
          'not-found',
          '対象のスペースメンバーが見つかりません。'
        )
      }

      const spaceMember = this.entryRequestDecisionService.decide({
        actor,
        target,
        decision: input.body.status
      })
      const updatedMember = await this.spaceMemberRepository.update(spaceMember)
      const firebaseUser = await auth.getUserByEmail(updatedMember.email)
      const spaceUser = new SpaceUser({
        id: updatedMember.id!,
        name: firebaseUser.displayName || undefined,
        image: firebaseUser.photoURL || undefined,
        spaceId: updatedMember.spaceId,
        userId: updatedMember.userId || undefined,
        email: updatedMember.email!,
        role: updatedMember.role,
        status: updatedMember.status,
        joinedAt: updatedMember.joinedAt || undefined
      })
      try {
        await Promise.all([
          this.signalingGateway.decideRequest(updatedMember),
          this.mediaGateway.changeMemberState({
            spaceId: input.params.spaceId,
            spaceUser
          })
        ])
      } catch (error) {
        Logger.warn(error)
        // signalingやmediaで失敗しても、状態は更新されているので成功
      }
      return {
        success: {
          id: updatedMember.id!,
          role: updatedMember.role,
          status: updatedMember.status
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
