import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetPublicRoomDto } from './dto/get-public-room.dto'

@Injectable()
export class GetPublicRoomUseCase {
  constructor(
    @Inject(forwardRef(() => IRoomRepository))
    private readonly roomRepository: IRoomRepository,
  ) {}

  async do(params: { page: number, limit: number }): Promise<
    UseCaseResult<
      GetPublicRoomDto,
      'internal'
    >
  > {
    try {
      const { page, limit } = params
      const [rooms, total] = await Promise.all([
        this.roomRepository.findRooms({ privacy: 'public', page, limit }),
        this.roomRepository.countRooms({ privacy: 'public'}),
      ])
      return {
        success: new GetPublicRoomDto({
          rooms,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        })
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
