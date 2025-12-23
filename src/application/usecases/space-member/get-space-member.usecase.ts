import { Inject, Injectable, Logger } from '@nestjs/common'
import { SpaceMember } from '@prisma/client'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'

type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class GetSpaceMemberUseCase {
  constructor(
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository
  ) {}
  async do(input: { spaceId: string; userId: string }): Promise<
    UseCaseResult<
      {
        id: string
        spaceId: string
        userId?: string
        email: string
        role: SpaceMember['role']
        status: SpaceMember['status']
        joinedAt?: Date
      }[],
      ErrorType
    >
  > {
    try {
      const spaceMembers = await this.spaceMemberRepository.findMany({
        spaceId: input.spaceId
      })
      const spaceMember = spaceMembers.find(
        (member) => member.userId === input.userId
      )
      if (!spaceMember || !spaceMember.isOwner()) {
        return this.error('forbidden', '取得の権限がありません。')
      }

      return {
        success: spaceMembers.map((spaceMember) => {
          return {
            id: spaceMember.id,
            spaceId: spaceMember.spaceId,
            userId: spaceMember.userId || undefined,
            email: spaceMember.email!,
            role: spaceMember.role,
            status: spaceMember.status,
            joinedAt: spaceMember.joinedAt || undefined
          }
        })
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
