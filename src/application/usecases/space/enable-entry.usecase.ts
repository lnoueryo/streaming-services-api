import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { GetRoomDto } from './dto/get-room.dto'
import { DomainError } from 'src/domain/errors/domain-error'
import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import { Participant } from 'src/domain/entities/participant.entity'
import { Room } from 'src/domain/entities/room.entity'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMember } from 'src/domain/entities/space-member.entity'

type EnableEntryUseCaseResult = {
  id: string
  privacy: SpacePrivacy
  membership: {
    role: SpaceMember['role']
    status: SpaceMember['status']
  }
  participants: Participant[]
  isParticipated: boolean
}

type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class EnableEntryUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository,
    @Inject(forwardRef(() => ISpaceMemberRepository))
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject(forwardRef(() => ISignalingGateway))
    private readonly signalingGateway: ISignalingGateway
  ) {}

  async do(params: {
    spaceId: string
    user: { id: string; email: string; token: string }
    body: { force?: boolean }
  }): Promise<UseCaseResult<EnableEntryUseCaseResult, ErrorType>> {
    try {
      const space = await this.spaceRepository.findSpace(params.spaceId)
      if (!space) {
        return this.error('not-found', 'スペースが存在しません')
      }

      const spaceMember = space.ensureMemberCanEnterRoom(params.user.email)
      try {
        if (params.body.force) {
          await this.signalingGateway.deleteRtcClient(params)
          //TODO: 削除対象がない場合、2度APIを叩いている可能性がある。同時に呼び出されたら両方入室してしまうため、ここではエラーを返すべき
        }
        spaceMember.enterRoom()
        await this.spaceMemberRepository.update(spaceMember)
        const room = await this.signalingGateway.getRoom(params)
        return this.success({ space, spaceMember, room, user: params.user })
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.code === 'invitation-not-accepted') {
            return this.error(
              'forbidden',
              '招待が未承認のため参加できません。招待メールを確認してください。',
              error.code
            )
          }
          if (error.code === 'required-approved-status') {
            return this.error(
              'forbidden',
              'Roomへの参加には承認が必要です。Ownerは準備中なのでそのまま許可をお待ちください。',
              error.code
            )
          }
          if (error.type === 'not-found') {
            return this.success({ space, spaceMember, user: params.user })
          }
        }
        throw error
      }
    } catch (error) {
      if (error instanceof DomainError) {
        if (error.type === 'forbidden') {
          return this.error(
            'forbidden',
            'スペースへの参加権限がありません',
            error.code
          )
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
    user
  }: {
    space: Space
    spaceMember: SpaceMember
    room?: Room
    user: { id: string }
  }) {
    return {
      success: new GetRoomDto({
        id: space.id,
        name: space.name,
        privacy: space.privacy,
        membership: {
          role: spaceMember.role,
          status: spaceMember.status
        },
        participants: room?.participants || [],
        isParticipated: room?.isUserParticipated(user.id) || false
      })
    }
  }

  private error(type: ErrorType, message: string, code?: string) {
    return { error: { type, message, code } }
  }
}
