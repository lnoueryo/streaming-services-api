import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { auth } from 'src/infrastructure/plugins/firebase-admin'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import { MemberRole } from 'src/domain/entities/space-member.entity'
import { IEmailService } from 'src/application/ports/services/email.service'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

type Member = {
  email: string
  role: Exclude<MemberRole, 'owner'>
}

@Injectable()
export class CreateSpaceUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository,
    @Inject(InviteSpaceService)
    private readonly inviteSpaceService: InviteSpaceService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
    private readonly prisma: PrismaService
  ) {}
  async do(params: {
    user: { id: string; email: string }
    body: {
      name?: string
      privacy: SpacePrivacy
      members?: Member[]
    }
  }): Promise<
    UseCaseResult<
      {
        space: {
          id: string
          privacy: SpacePrivacy
          name?: string
          creatorId: string
        }
        url: string
      },
      'validation' | 'internal'
    >
  > {
    try {
      const space = new Space({
        name: params.body.name,
        privacy: params.body.privacy,
        creatorId: params.user.id
      })

      if (!space.isPublic()) {
        space.assignOwner({
          userId: params.user.id,
          email: params.user.email
        })
        const fetchUsers: Array<
          Promise<{
            request: Member
            data: { uid: string } | null
          }>
        > = []
        for (const member of params.body.members ?? []) {
          fetchUsers.push(
            auth
              .getUserByEmail(member.email)
              .then((userRecord) => {
                return {
                  request: member,
                  data: userRecord
                }
              })
              .catch(() => {
                return {
                  request: member,
                  data: null
                }
              })
          )
        }
        const firebaseUsers = await Promise.all(fetchUsers)
        for (const firebaseUser of firebaseUsers) {
          if (!firebaseUser.data) {
            space.addMember({
              email: firebaseUser.request.email,
              role: firebaseUser.request.role
            })
            continue
          }
          if (firebaseUser.data.uid === params.user.id) {
            continue
          }
          space.addMember({
            userId: firebaseUser.data.uid,
            email: firebaseUser.request.email,
            role: firebaseUser.request.role
          })
        }
      }

      await this.prisma.$transaction(async (tx) => {
        const spaceRepo = this.spaceRepository.transaction(tx)
        await spaceRepo.create(space)
        const invitation = this.inviteSpaceService.createInvitation(space)
        const result = await this.emailService.sendMail(invitation)
        if (result.status !== 'success') {
          throw result
        }
      })
      const token = this.inviteSpaceService.generate(space)
      return {
        success: {
          space: {
            id: space.id,
            name: space.name || undefined,
            privacy: space.privacy,
            creatorId: space.creatorId
          },
          url: `/space/invite/${token}`
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
