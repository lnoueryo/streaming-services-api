import { Inject, Injectable, Logger } from '@nestjs/common'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { SpaceUser } from 'src/domain/entities/space-user.entity'
import { auth } from 'src/infrastructure/plugins/firebase-admin'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

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
        name?: string
        image?: string
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
        const spaceMemberRepo = this.spaceMemberRepository.transaction(tx)
        return await spaceMemberRepo.upsertMany(spaceMembers)
      })
      const firebaseUsers = await auth.getUsers(
        spaceMembers.map((member) => ({ email: member.email }))
      )
      const userMap = new Map(
        firebaseUsers.users.map((user) => [user.email, user])
      )
      const spaceUsers = spaceMembers.map((spaceMember) => {
        const firebaseUser = userMap.get(spaceMember.email)
        return new SpaceUser({
          id: spaceMember.id,
          name: firebaseUser?.displayName || undefined,
          image: firebaseUser?.photoURL || undefined,
          spaceId: spaceMember.spaceId,
          userId: spaceMember.userId || undefined,
          email: spaceMember.email!,
          role: spaceMember.role,
          status: spaceMember.status,
          joinedAt: spaceMember.joinedAt || undefined
        })
      })
      const changeMemberStatePromise = spaceUsers.map((spaceUser) => {
        return this.mediaGateway.changeMemberState({
          spaceId: input.spaceId,
          spaceUser: spaceUser
        })
      })
      try {
        await Promise.all(changeMemberStatePromise)
      } catch (error) {
        Logger.warn(error)
      }
      return {
        success: spaceUsers.map((spaceUser) => ({
          id: spaceUser.id,
          name: spaceUser.name,
          image: spaceUser.image,
          spaceId: spaceUser.spaceId,
          userId: spaceUser.userId,
          email: spaceUser.email,
          role: spaceUser.role,
          status: spaceUser.status,
          joinedAt: spaceUser.joinedAt
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
