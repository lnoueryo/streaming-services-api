import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { GetPublicSpaceDto } from './dto/get-public-space.dto'

@Injectable()
export class GetPublicSpaceUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository
  ) {}

  async do(params: {
    page: number
    limit: number
  }): Promise<UseCaseResult<GetPublicSpaceDto, 'internal'>> {
    try {
      const { page, limit } = params
      const [spaces, total] = await Promise.all([
        this.spaceRepository.findSpaces({ privacy: 'public', page, limit }),
        this.spaceRepository.countSpaces({ privacy: 'public' })
      ])
      return {
        success: new GetPublicSpaceDto({
          spaces,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        })
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
