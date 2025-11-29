import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetTargetRoomDto } from './dto/get-target-room.dto'

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(forwardRef(() => IRoomRepository))
    private readonly roomRepository: IRoomRepository,
  ) {}

  async do(): Promise<UseCaseResult<GetTargetRoomDto, 'internal'>> {
    try {
      const room = await this.roomRepository.create()
      return {
        success: new GetTargetRoomDto(room)
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
