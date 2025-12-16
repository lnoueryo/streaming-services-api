import { DomainError } from '../errors/domain-error'
import { BaseEntity } from './base.entity'
import { SpaceMember } from './space-member.entity'

export type SpacePrivacy = 'public' | 'protected' | 'private'
export class Space extends BaseEntity {
  readonly id: string
  readonly name?: string
  readonly privacy: SpacePrivacy
  readonly creatorId: string
  readonly spaceMembers?: SpaceMember[]

  constructor(params: {
    id: string
    name?: string
    privacy: SpacePrivacy
    creatorId: string
    spaceMembers?: SpaceMember[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    super(params)
    this.id = params.id
    this.name = params.name
    this.privacy = params.privacy
    this.creatorId = params.creatorId
    this.spaceMembers = params?.spaceMembers
  }
  isPublic() {
    return this.privacy === 'public'
  }
  isProtected() {
    return this.privacy === 'protected'
  }
  isPrivate() {
    return this.privacy === 'private'
  }
  getSpaceMemberByEmail(email: string): SpaceMember | undefined {
    return this.spaceMembers.find((member) => member.email === email)
  }
  joinProtected(
    userId: string,
    email: string
  ): SpaceMember | null {
    if (!this.isProtected()) {
      throw new DomainError({
        type: 'internal',
        message: 'this space is not protected space',
        code: 'invalid-space-privacy'
      })
    }
    const spaceMember = this.getSpaceMemberByEmail(email)

    if (spaceMember) {
      if (!spaceMember.canJoin()) {
        throw new DomainError({
          type: 'forbidden',
          message: 'space member is rejected by owner',
          code: 'member-rejected'
        })
      }
      if (!spaceMember.isAcceptInvitation()) {
        spaceMember.acceptInvitation(userId)
        return spaceMember
      }
      // 招待承認済み
      return
    }

    const newMember = new SpaceMember({
      role: 'member',
      status: 'none',
      spaceId: this.id,
      userId,
      email
    })
    return newMember
  }
  joinPrivate(userId: string, email: string): SpaceMember | undefined {
    if (!this.isPrivate()) {
      throw new DomainError({
        type: 'internal',
        message: 'this space is not private space',
        code: 'invalid-space-privacy'
      })
    }
    const invitedMember = this.getSpaceMemberByEmail(email)
    if (!invitedMember) {
      throw new DomainError({
        type: 'forbidden',
        message: 'invitedMember is not found for given email',
        code: 'no-invitation'
      })
    }
    if (!invitedMember.canJoin()) {
      throw new DomainError({
        type: 'forbidden',
        message: 'space member is rejected by owner',
        code: 'member-rejected'
      })
    }
    if (!invitedMember.isAcceptInvitation()) {
      invitedMember.acceptInvitation(userId)
    }
    // 招待承認済み
    return
  }
}
