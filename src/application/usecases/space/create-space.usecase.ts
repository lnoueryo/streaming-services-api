import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { auth } from 'src/infrastructure/plugins/firebase-admin'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import {
  MemberRole
} from 'src/domain/entities/space-member.entity'

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
    private readonly inviteSpaceService: InviteSpaceService
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
          name?: string | null
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

      const createdSpace = await this.spaceRepository.create(space)
      const token = this.inviteSpaceService.generate(createdSpace)
      return {
        success: {
          space: {
            id: createdSpace.id,
            name: createdSpace.name,
            privacy: createdSpace.privacy
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
