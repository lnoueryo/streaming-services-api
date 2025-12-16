import { BaseEntity } from './base.entity'

export type MemberRole = 'owner' | 'admin' | 'member'
export type MemberStatus = 'approved' | 'pending' | 'rejected' | 'none'

export class SpaceMember extends BaseEntity {
  readonly id?: number
  readonly spaceId: string
  private _userId?: string
  readonly email: string
  readonly role: MemberRole
  readonly status: MemberStatus
  readonly joinedAt?: Date

  constructor(params: {
    id?: number
    spaceId: string
    userId?: string
    email: string
    role: MemberRole
    status: MemberStatus
    joinedAt?: Date
    createdAt?: Date
    updatedAt?: Date
  }) {
    super(params)
    this.id = params.id
    this.spaceId = params.spaceId
    this._userId = params.userId
    this.email = params.email
    this.role = params.role
    this.status = params.status
    this.joinedAt = params.joinedAt
  }
  canJoin() {
    return this.status !== 'rejected'
  }
  isAcceptInvitation() {
    return !!this.userId
  }
  acceptInvitation(userId: string) {
    this._userId = userId
  }
  get userId() {
    return this._userId
  }
  static initialStatus(role: MemberRole): MemberStatus {
    return role === 'member' ? 'none' : 'approved'
  }
}
