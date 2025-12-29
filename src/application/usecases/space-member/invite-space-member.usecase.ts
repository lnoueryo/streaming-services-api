import { Inject, Injectable, Logger } from '@nestjs/common'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { PrismaService } from 'src/infrastructure/plugins/prisma'
import { SpaceMemberRepository } from 'src/infrastructure/repositories/space-member.repository'
type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class InviteSpaceMemberUseCase {
  constructor(
    @Inject(ISpaceMemberRepository)
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    private readonly prisma: PrismaService,
    @Inject(IMediaGateway)
    private readonly mediaGateway: IMediaGateway
  ) {}
  async do(input: {
    spaceId: string
    userId: string
    members: { email: string; role: 'member' | 'admin' }[]
  }): Promise<
    UseCaseResult<
      {
        id: string
        spaceId: string
        email: string
        role: SpaceMember['role']
        status: SpaceMember['status']
      }[],
      ErrorType
    >
  > {
    try {
      const owner = await this.spaceMemberRepository.findByUserId({
        spaceId: input.spaceId,
        userId: input.userId
      })
      if (!owner || !owner.isOwner()) {
        return this.error('forbidden', 'スペースのオーナーではありません。')
      }
      const spaceMembers = input.members.map((member) => {
        return new SpaceMember({
          spaceId: input.spaceId,
          email: member.email,
          role: member.role,
          status: SpaceMember.initialStatus(member.role)
        })
      })
      await this.prisma.$transaction(async (tx) => {
        await this.spaceMemberRepository
          .transaction(tx)
          .createMany(spaceMembers)
      })
      const changeMemberStatePromise = spaceMembers.map((spaceMember) => {
        return this.mediaGateway.changeMemberState({
          spaceId: input.spaceId,
          spaceMember: spaceMember
        })
      })
      try {
        await Promise.all(changeMemberStatePromise)
      } catch (error) {
        Logger.warn(error)
      }
      return {
        success: spaceMembers.map((member) => ({
          id: member.id,
          spaceId: member.spaceId,
          email: member.email,
          role: member.role,
          status: member.status
        }))
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
