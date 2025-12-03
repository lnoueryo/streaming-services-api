import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetTargetRoomDto } from './dto/get-target-room.dto'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import axios from 'axios'
import { UseCaseError } from 'src/application/ports/usecases/usecase-error'

@Injectable()
export class JoinRoomUseCase {
  constructor(
    @Inject(forwardRef(() => IRoomRepository))
    private readonly roomRepository: IRoomRepository,
    @Inject(forwardRef(() => ISignalingGateway))
    private readonly signalingGateway: ISignalingGateway,
  ) {}

  async do(params: { roomId: string, user: { id: string, token: string } }): Promise<
    UseCaseResult<
      GetTargetRoomDto,
      'not-found' |
      'unauthorized' |
      'conflict' |
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
      await this.signalingGateway.checkIfCanJoin(params)
      return {
        success: new GetTargetRoomDto(room)
      }
    } catch (error) {
      if (error instanceof UseCaseError) {
        if (error.type === 'unauthorized') {
          return {
            error: {
              type: error.type,
              message: error.message,
            }
          }
        }
        if (error.type === 'conflict') {
          return {
            error: {
              type: error.type,
              message: error.message,
            }
          }
        }
      }
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
