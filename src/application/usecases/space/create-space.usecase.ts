import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { auth } from 'src/infrastructure/plugins/firebase-admin'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { SpacePrivacy } from 'src/domain/entities/space.entity'
import { MemberRole } from 'src/domain/entities/space-member.entity'

type Member = {
  email: string
  role: Exclude<MemberRole, 'owner'>
}
type DefaultMemberStatus = 'approved' | 'none'

@Injectable()
export class CreateSpaceUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository,
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
          name?: string
        }
        url: string
      },
      'validation' | 'internal'
    >
  > {
    try {
      const members: {
        userId?: string
        email: string
        role: MemberRole
        status: DefaultMemberStatus
      }[] = []
      if (params.body.privacy !== 'public') {
        const fetchUsers: Array<
          Promise<{
            request: Member
            data: { uid: string } | null
          }>
        > = []
        for (const member of params.body.members) {
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
            members.push({
              userId: undefined,
              email: firebaseUser.request.email,
              role: firebaseUser.request.role,
              status:
                firebaseUser.request.role === 'member' ? 'none' : 'approved'
            })
            continue
          }
          if (firebaseUser.data.uid === params.user.id) {
            continue
          }
          members.push({
            userId: firebaseUser.data.uid,
            email: firebaseUser.request.email,
            role: firebaseUser.request.role,
            status: firebaseUser.request.role === 'member' ? 'none' : 'approved'
          })
        }
        // 作成者のロールはownerで登録
        const creatorMember = {
          userId: params.user.id,
          email: params.user.email,
          role: 'owner' as const,
          status: 'approved' as const
        }
        members.push(creatorMember)
      }
      const payload = {
        name: params.body.name,
        privacy: params.body.privacy,
        creatorId: params.user.id,
        members
      }
      const space = await this.spaceRepository.create(payload)
      const url = this.inviteSpaceService.generate(space)
      return {
        success: {
          space: {
            id: space.id,
            name: space.name,
            privacy: space.privacy
          },
          url
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
