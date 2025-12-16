import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { GetRoomDto } from './dto/get-room.dto'
import { DomainError } from 'src/domain/errors/domain-error'
import { SpacePrivacy } from 'src/domain/entities/space.entity'
import { Participant } from 'src/domain/entities/participant.entity'

type EnableEntryUseCaseResult = {
  id: string
  privacy: SpacePrivacy
  participants: Participant[]
  isParticipated: boolean
}

@Injectable()
export class EnableEntryUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository,
    @Inject(forwardRef(() => ISignalingGateway))
    private readonly signalingGateway: ISignalingGateway
  ) {}

  async do(params: {
    spaceId: string
    user: { id: string; token: string }
    body: { force?: boolean }
  }): Promise<
    UseCaseResult<EnableEntryUseCaseResult, 'not-found' | 'internal'>
  > {
    try {
      const space = await this.spaceRepository.findSpace(params.spaceId)
      if (!space) {
        return {
          error: {
            type: 'not-found',
            message: 'スペースが存在しません'
          }
        }
      }
      try {
        if (params.body.force) {
          const room = await this.signalingGateway.deleteRtcClient(params)
          return {
            success: new GetRoomDto({
              id: space.id,
              privacy: space.privacy,
              participants: room.participants,
              isParticipated: room.isUserParticipated(params.user.id)
            })
          }
        }
        const room = await this.signalingGateway.getRoom(params)
        return {
          success: new GetRoomDto({
            id: space.id,
            privacy: space.privacy,
            participants: room.participants,
            isParticipated: room.isUserParticipated(params.user.id)
          })
        }
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.type === 'not-found') {
            return {
              success: new GetRoomDto({
                id: space.id,
                privacy: space.privacy,
                participants: [],
                isParticipated: false
              })
            }
          }
        }
        throw error
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
