import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetTargetSpaceDto } from './dto/get-target-space.dto'

@Injectable()
export class CreateSpaceUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository
  ) {}

  async do(): Promise<UseCaseResult<GetTargetSpaceDto, 'internal'>> {
    try {
      const space = await this.spaceRepository.create()
      return {
        success: new GetTargetSpaceDto(space)
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
