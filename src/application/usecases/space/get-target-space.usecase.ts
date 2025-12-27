import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'

@Injectable()
export class GetTargetSpaceUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository
  ) {}

  async do(params: { id: string }): Promise<UseCaseResult<{
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
  }, 'not-found' | 'internal'>> {
    try {
      const space = await this.spaceRepository.findSpace(params.id)
      if (!space) {
        return {
          error: {
            type: 'not-found',
            message: 'Internal Server Error'
          }
        }
      }
      return {
        success: {
          id: space.id,
          name: space?.name || undefined,
          privacy: space.privacy,
          creatorId: space.creatorId,
          spaceMembers: space.spaceMembers.map((member) => ({
            id: member.id,
            spaceId: member.spaceId,
            userId: member.userId || undefined,
            email: member.email,
            role: member.role,
            status: member.status
          })) || []
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
