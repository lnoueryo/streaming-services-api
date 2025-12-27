import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'

@Injectable()
export class GetPublicSpaceUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository
  ) {}

  async do(params: { page: number; limit: number }): Promise<
    UseCaseResult<
      {
        spaces: {
          id: string
          name?: string
          privacy: string
          creatorId: string
          spaceMembers: {
            id: string
            spaceId: string
            userId?: string
            email: string
            role: string
            status: string
          }[]
        }[]
        page: number
        limit: number
        total: number
        totalPages: number
      },
      'internal'
    >
  > {
    try {
      const { page, limit } = params
      const [spaces, total] = await Promise.all([
        this.spaceRepository.findSpaces({ privacy: 'public', page, limit }),
        this.spaceRepository.countSpaces({ privacy: 'public' })
      ])
      return {
        success: {
          spaces: spaces.map((space) => ({
            id: space.id,
            name: space.name || undefined,
            privacy: space.privacy,
            creatorId: space.creatorId,
            spaceMembers: space.spaceMembers.map((member) => ({
              id: member.id,
              spaceId: member.spaceId,
              userId: member.userId || undefined,
              email: member.email,
              role: member.role,
              status: member.status
            }))
          })),
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
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
