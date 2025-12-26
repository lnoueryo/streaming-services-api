import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetRoomDto } from './dto/get-room.dto'
import { DomainError } from 'src/domain/errors/domain-error'
import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import { Participant } from 'src/domain/entities/participant.entity'
import { Room } from 'src/domain/entities/room.entity'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

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

type ErrorType = 'forbidden' | 'not-found' | 'conflict' | 'internal'

@Injectable()
export class EnableEntryUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository,
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject(IMediaGateway)
    private readonly mediaGateway: IMediaGateway,
    @Inject(InviteSpaceService)
    private readonly inviteSpaceService: InviteSpaceService,
    private readonly prisma: PrismaService
  ) {}

  async do(params: {
    spaceId: string
    user: { id: string; email: string; name: string; image: string }
    body: { force?: boolean }
  }): Promise<UseCaseResult<EnableEntryUseCaseResult, ErrorType>> {
    try {
      const space = await this.spaceRepository.findSpace(params.spaceId)
      if (!space) {
        return this.error('not-found', 'スペースが存在しません')
      }
      const spaceMember = space.ensureMemberCanEnterRoom(params.user.email)
      if (!spaceMember) {
        return this.success({ space, user: params.user })
      }
      const invitationToken = spaceMember?.isOwner()
        ? this.inviteSpaceService.generate(space)
        : undefined
      try {
        if (params.body.force) {
          await this.mediaGateway.removeParticipant(params)
        }
        spaceMember.enterRoom()
        const room = await this.prisma.$transaction(async (tx) => {
          const spaceMemberRepository =
            this.spaceMemberRepository.transaction(tx)
          await spaceMemberRepository.update(spaceMember)
          console.log('createPeer')
          return await this.mediaGateway.createPeer({
            spaceId: space.id,
            spaceMember,
            user: params.user
          })
        })
        return this.success({
          space,
          spaceMember,
          room,
          user: params.user,
          invitationToken
        })
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
          if (error.code === 'no-target-user') {
            return this.error(
              'not-found',
              '対象の参加者が存在しません。時間をおいてからもう一度ルームに参加してください。',
              error.code
            )
          }
          if (error.code === 'participant-already-exists') {
            return this.error(
              'conflict',
              error.message,
              error.code
            )
          }
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
