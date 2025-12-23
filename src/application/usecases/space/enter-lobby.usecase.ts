import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { GetRoomDto } from './dto/get-room.dto'
import { DomainError } from 'src/domain/errors/domain-error'
import { Space } from 'src/domain/entities/space.entity'
import { Room } from 'src/domain/entities/room.entity'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'

type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class EnterLobbyUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository,
    @Inject(ISignalingGateway)
    private readonly signalingGateway: ISignalingGateway,
    @Inject(InviteSpaceService)
    private readonly inviteSpaceService: InviteSpaceService
  ) {}

  async do(params: {
    spaceId: string
    user: { id: string; email: string; token: string }
  }): Promise<UseCaseResult<GetRoomDto, ErrorType>> {
    try {
      const space = await this.spaceRepository.findSpace(params.spaceId)
      if (!space) {
        return this.error('not-found', 'スペースが存在しません')
      }
      const spaceMember = space.ensureMemberCanEnterLobby(params.user.email)
      const invitationToken = spaceMember?.isOwner()
        ? this.inviteSpaceService.generate(space)
        : undefined
      try {
        const room = await this.signalingGateway.getRoom(params)
        return this.success({
          space,
          spaceMember,
          room,
          user: params.user,
          invitationToken
        })
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.type === 'not-found') {
            return this.success({
              space,
              spaceMember,
              user: params.user,
              invitationToken
            })
          }
        }
        throw error
      }
    } catch (error) {
      if (error instanceof DomainError) {
        if (error.code === 'invitation-not-accepted') {
          return this.error(
            'forbidden',
            '招待が未承認のため参加できません。招待メールを確認してください。',
            error.code
          )
        }
        if (error.type === 'forbidden') {
          return this.error('forbidden', error.message, error.code)
        }
      }
      Logger.error(error)
      return this.error('internal', 'Internal Server Error')
    }
  }

  private success({
    space,
    spaceMember,
    room,
    user,
    invitationToken
  }: {
    space: Space
    spaceMember?: SpaceMember
    room?: Room
    user: { id: string }
    invitationToken?: string
  }) {
    return {
      success: new GetRoomDto({
        id: space.id,
        name: space.name || undefined,
        privacy: space.privacy,
        membership: {
          // TODO: publicでも一応SpaceMemberは必要かも？
          role: spaceMember?.role || 'member',
          status: spaceMember?.status || 'approved'
        },
        participants: room?.participants || [],
        isParticipated: room?.isUserParticipated(user.id) || false,
        invitationToken
      })
    }
  }

  private error(type: ErrorType, message: string, code?: string) {
    return { error: { type, message, code } }
  }
}
