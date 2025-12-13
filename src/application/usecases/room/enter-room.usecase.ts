import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetTargetRoomDto } from './dto/get-target-room.dto'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { UseCaseError } from 'src/application/ports/usecases/usecase-error'
import { EnterLobbyDto } from './dto/enter-lobby.dto'

@Injectable()
export class EnterRoomUseCase {
  constructor(
    @Inject(forwardRef(() => IRoomRepository))
    private readonly roomRepository: IRoomRepository,
    @Inject(forwardRef(() => ISignalingGateway))
    private readonly signalingGateway: ISignalingGateway,
  ) {}

  async do(params: { roomId: string, user: { id: string, token: string }, body: { force?: boolean} }): Promise<
    UseCaseResult<
      EnterLobbyDto,
      'not-found' |
      'internal'
    >
  > {
    try {
      const room = await this.roomRepository.findRoom({ id: params.roomId })
      if (!room) {
        return {
          error: {
            type: 'not-found',
            message: '部屋が存在しません',
          },
        }
      }
      try {
        if (params.body.force) {
          const runtimeRoom = await this.signalingGateway.deleteRtcClient(params)
        }
        const runtimeRoom = await this.signalingGateway.getRoom(params)
        return {
          success: new EnterLobbyDto(
            {
              ...room,
              ...runtimeRoom,
            },
            params.user
          )
        }
      } catch (error) {
        if (error instanceof UseCaseError) {
          if (error.type === 'not-found') {
            return {
              success: new EnterLobbyDto(
                {
                  ...room,
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
          message: 'Internal Server Error',
        }
      }
    }
  }
}
