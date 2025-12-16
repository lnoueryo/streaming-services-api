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
  canAccept(email: string) {
    const spaceMember = this.getSpaceMemberByEmail(email)
    if (this.isPrivate() && !spaceMember) {
      return false
    }
    if (spaceMember && spaceMember.canJoin()) {
      return false
    }
    return true
  }
  getSpaceMemberByEmail(email: string): SpaceMember | undefined {
    return this.spaceMembers.find((member) => member.email === email)
  }
  joinProtected(
    userId: string,
    email: string
  ): {
    newMember?: SpaceMember
    invitedMember?: SpaceMember
  } {
    const spaceMember = this.getSpaceMemberByEmail(email)

    if (spaceMember) {
      if (!spaceMember.isAcceptInvitation()) {
        spaceMember.acceptInvitation(userId)
        return { invitedMember: spaceMember }
      }
      // 招待承認済み
      return {}
    }

    const newMember = new SpaceMember({
      role: 'member',
      status: 'none',
      spaceId: this.id,
      userId,
      email
    })
    return { newMember }
  }
  joinPrivate(userId: string, email: string): { invitedMember?: SpaceMember } {
    const invitedMember = this.getSpaceMemberByEmail(email)!
    if (!invitedMember.isAcceptInvitation()) {
      invitedMember.acceptInvitation(userId)
      return { invitedMember }
    }
    // 招待承認済み
    return {}
  }
}
