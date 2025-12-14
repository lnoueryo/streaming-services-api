import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { GetRoomDto } from './dto/get-room.dto'
import { UseCaseError } from 'src/application/ports/usecases/usecase-error'

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
  }): Promise<UseCaseResult<GetRoomDto, 'not-found' | 'internal'>> {
    try {
      const space = await this.spaceRepository.findSpace({ id: params.spaceId })
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
            success: new GetRoomDto(
              {
                id: space.id,
                privacy: space.privacy,
                participants: room.participants
              },
              params.user
            )
          }
        }
        const room = await this.signalingGateway.getRoom(params)
        return {
          success: new GetRoomDto(
            {
              id: space.id,
              privacy: space.privacy,
              participants: room.participants
            },
            params.user
          )
        }
      } catch (error) {
        if (error instanceof UseCaseError) {
          if (error.type === 'not-found') {
            return {
              success: new GetRoomDto(
                {
                  id: space.id,
                  privacy: space.privacy,
                  participants: []
                },
                params.user
              )
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
