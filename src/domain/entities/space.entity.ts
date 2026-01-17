import { DomainError } from '../errors/domain-error'
import { BaseEntity } from './base.entity'
import { SpaceMember } from './space-member.entity'
import { v7 as uuidv7 } from 'uuid'

export type SpacePrivacy = 'public' | 'protected' | 'private'
export class Space extends BaseEntity {
  readonly id: string
  readonly name?: string | null
  readonly privacy: SpacePrivacy
  readonly creatorId: string
  readonly spaceMembers: SpaceMember[]

  constructor(params: {
    id?: string
    name?: string | null
    privacy: SpacePrivacy
    creatorId: string
    spaceMembers?: SpaceMember[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    super(params)
    this.id = params.id || uuidv7()
    this.name = params.name
    this.privacy = params.privacy
    this.creatorId = params.creatorId
    this.spaceMembers = params?.spaceMembers || []
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
  getSpaceMemberByUserId(userId: string): SpaceMember | undefined {
    return this.spaceMembers.find((member) => member.userId === userId)
  }
  allowMemberToAcceptProtectedInvitation(
    userId: string,
    email: string
  ): SpaceMember | undefined {
    if (!this.isProtected()) {
      throw new DomainError({
        type: 'internal',
        message: 'this space is not protected space',
        code: 'invalid-space-privacy'
      })
    }
    const spaceMember = this.getSpaceMemberByEmail(email)

    if (spaceMember) {
      if (spaceMember.isRejectedByOwner()) {
        throw new DomainError({
          type: 'forbidden',
          message: 'space member is rejected by owner',
          code: 'member-rejected'
        })
      }
      if (spaceMember.hasNotAcceptedInvitation()) {
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
  allowMemberToAcceptPrivateInvitation(
    userId: string,
    email: string
  ): SpaceMember | undefined {
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
    if (invitedMember.isRejectedByOwner()) {
      throw new DomainError({
        type: 'forbidden',
        message: 'space member is rejected by owner',
        code: 'member-rejected'
      })
    }
    if (invitedMember.hasNotAcceptedInvitation()) {
      invitedMember.acceptInvitation(userId)
      return invitedMember
    }
    // 招待承認済み
    return
  }
  addMember(memberParams: {
    userId?: string
    email: string
    role: 'owner' | 'admin' | 'member'
  }) {
    const existingMember = this.getSpaceMemberByEmail(memberParams.email)
    if (existingMember) {
      throw new DomainError({
        type: 'validation',
        message: 'Member with this email already exists in the space',
        code: 'member-already-exists'
      })
    }
    const newMember = new SpaceMember({
      spaceId: this.id,
      userId: memberParams.userId,
      email: memberParams.email,
      role: memberParams.role,
      status: SpaceMember.initialStatus(memberParams.role)
    })
    this.spaceMembers.push(newMember)
    return newMember
  }
  assignOwner(ownerParams: { userId: string; email: string }) {
    const owner = new SpaceMember({
      spaceId: this.id,
      userId: ownerParams.userId,
      email: ownerParams.email,
      role: 'owner' as const,
      status: 'approved' as const
    })
    this.spaceMembers.push(owner)
  }
  ensureMemberCanEnterLobby(email: string): SpaceMember | undefined {
    if (this.isPublic()) {
      return
    }
    const spaceMember = this.getSpaceMemberByEmail(email)
    if (!spaceMember) {
      throw new DomainError({
        type: 'forbidden',
        code: 'no-membership',
        message: 'user is not a member of this space'
      })
    }
    if (spaceMember.isRejectedByOwner()) {
      throw new DomainError({
        type: 'forbidden',
        code: 'member-rejected',
        message: 'member is rejected by owner'
      })
    }

    if (spaceMember.hasNotAcceptedInvitation()) {
      throw new DomainError({
        type: 'forbidden',
        code: 'invitation-not-accepted',
        message: 'invitation not accepted'
      })
    }
    return spaceMember
  }
  ensureMemberCanEnterRoom(email: string): SpaceMember | undefined {
    const spaceMember = this.ensureMemberCanEnterLobby(email)
    if (!spaceMember) {
      return
    }
    if (spaceMember.status !== 'approved') {
      throw new DomainError({
        type: 'forbidden',
        code: 'required-approved-status',
        message: 'member status is not approved'
      })
    }
    return spaceMember
  }
  get creator(): SpaceMember {
    return this.spaceMembers.find(
      (member) => member!.userId === this.creatorId
    )!
  }
}
