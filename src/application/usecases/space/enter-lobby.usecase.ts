import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { GetRoomDto } from './dto/get-room.dto'
import { DomainError } from 'src/domain/errors/domain-error'
import { Space } from 'src/domain/entities/space.entity'
import { Room } from 'src/domain/entities/room.entity'

type ErrorType = 'not-found' | 'internal'

@Injectable()
export class EnterLobbyUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository,
    @Inject(forwardRef(() => ISignalingGateway))
    private readonly signalingGateway: ISignalingGateway
  ) {}

  async do(params: {
    spaceId: string
    user: { id: string; token: string }
  }): Promise<UseCaseResult<GetRoomDto, 'not-found' | 'internal'>> {
    try {
      const space = await this.spaceRepository.findSpace(params.spaceId)
      if (!space) {
        return this.error('not-found', 'スペースが存在しません')
      }
      try {
        const room = await this.signalingGateway.getRoom(params)
        return this.success({ space, room, user: params.user })
      } catch (error) {
        if (error instanceof DomainError) {
          if (error.type === 'not-found') {
            return this.success({ space, user: params.user })
          }
        }
        throw error
      }
    } catch (error) {
      Logger.error(error)
      return this.error('internal', 'Internal Server Error')
    }
  }

  private success({ space, room, user }: {
    space: Space,
    room?: Room,
    user: { id: string }
  }) {
    return {
      success: new GetRoomDto({
        id: space.id,
        name: space.name,
        privacy: space.privacy,
        participants: room?.participants || [],
        isParticipated: room?.isUserParticipated(user.id) || false
      })
    }
  }

  private error(type: ErrorType, message: string) {
    return { error: { type, message } }
  }
}
