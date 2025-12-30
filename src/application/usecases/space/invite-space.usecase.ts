import { Inject, Injectable, Logger } from '@nestjs/common'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { IEmailService } from 'src/application/ports/services/email.service'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { SpaceUser } from 'src/domain/entities/space-user.entity'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { auth } from 'src/infrastructure/plugins/firebase-admin'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

type ErrorType = 'forbidden' | 'not-found' | 'internal'

@Injectable()
export class InviteSpaceUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository,
    @Inject(IMediaGateway)
    private readonly mediaGateway: IMediaGateway,
    private readonly inviteSpaceService: InviteSpaceService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    private readonly prisma: PrismaService
  ) {}
  async do(input: {
    spaceId: string
    user: { id: string; email: string }
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
      const space = await this.spaceRepository.findSpace(input.spaceId)
      if (!space) {
        return this.error('not-found', 'スペースが見つかりません。')
      }
      const owner = space.getSpaceMemberByEmail(input.user.email)
      if (!owner || !owner.isOwner()) {
        return this.error('forbidden', 'スペースのオーナーではありません。')
      }
      const spaceMembers = input.members.map((member) => {
        return space.addMember({
          email: member.email,
          role: member.role
        })
      })
      const spaceUsers = await this.prisma.$transaction(async (tx) => {
        const spaceRepo = this.spaceRepository.transaction(tx)
        await spaceRepo.update(space)
        const invitation = this.inviteSpaceService.createInvitation(space)
        const result = await this.emailService.sendMail(invitation)
        if (result.status !== 'success') {
          throw result
        }
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
        return spaceUsers
      })
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
