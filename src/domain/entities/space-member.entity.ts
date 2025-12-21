import { BaseEntity } from './base.entity'
import { DomainError } from '../errors/domain-error'

export type MemberRole = 'owner' | 'admin' | 'member'
export type MemberStatus = 'approved' | 'pending' | 'rejected' | 'none'

export class SpaceMember extends BaseEntity {
  readonly id?: number
  readonly spaceId: string
  private _userId?: string | null
  readonly email: string
  readonly role: MemberRole
  private _status: MemberStatus
  private _joinedAt?: Date | null

  constructor(params: {
    id?: number
    spaceId: string
    userId?: string | null
    email: string
    role: MemberRole
    status: MemberStatus
    joinedAt?: Date | null
    createdAt?: Date
    updatedAt?: Date
  }) {
    super(params)
    this.id = params.id
    this.spaceId = params.spaceId
    this._userId = params.userId
    this.email = params.email
    this.role = params.role
    this._status = params.status
    this._joinedAt = params.joinedAt
  }
  canEnterLobby() {
    return !this.isRejectedByOwner() && !this.hasNotAcceptedInvitation()
  }
  isRejectedByOwner() {
    return this.status === 'rejected'
  }
  hasNotAcceptedInvitation() {
    return !this.userId
  }
  isOwner() {
    return this.role === 'owner'
  }
  acceptInvitation(userId: string) {
    this._userId = userId
  }
  enterRoom() {
    this._joinedAt = new Date()
  }
  requestEntry() {
    if (this.isRejectedByOwner()) {
      throw new DomainError({
        type: 'forbidden',
        message: 'space member is rejected by owner',
        code: 'member-rejected'
      })
    }
    if (this._status !== 'none') {
      throw new DomainError({
        type: 'conflict',
        message: 'space member status has already changed',
        code: 'invalid-status'
      })
    }
    this._status = 'pending'
  }
  applyEntryDecision(decision: 'approved' | 'rejected') {
    this._status = decision
  }
  get userId() {
    return this._userId
  }
  get joinedAt() {
    return this._joinedAt
  }
  get status() {
    return this._status
  }
  static initialStatus(role: MemberRole): MemberStatus {
    return role === 'member' ? 'none' : 'approved'
  }
}
