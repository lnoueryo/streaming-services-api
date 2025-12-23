import { Inject, Injectable, Logger } from '@nestjs/common'
import { SpaceMember } from '@prisma/client'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'

type ErrorType = 'not-found' | 'internal'

@Injectable()
export class GetTargetSpaceMemberUseCase {
  constructor(
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository
  ) {}
  async do(input: { spaceId: string; userId: string }): Promise<
    UseCaseResult<
      {
        id: string
        spaceId: string
        userId: string
        email: string
        role: SpaceMember['role']
      },
      ErrorType
    >
  > {
    try {
      const spaceMember = await this.spaceMemberRepository.findByUserId({
        spaceId: input.spaceId,
        userId: input.userId
      })
      if (!spaceMember) {
        return this.error('not-found', 'スペースメンバーが見つかりません')
      }

      return {
        success: {
          id: spaceMember.id,
          spaceId: spaceMember.spaceId,
          userId: spaceMember.userId!,
          email: spaceMember.email!,
          role: spaceMember.role
        }
      }
    } catch (error) {
      Logger.error(error)
      return this.error('internal', 'Internal Server Error')
    }
  }
  private error(type: ErrorType, message: string) {
    return {
      error: {
        type,
        message
      }
    }
  }
}
