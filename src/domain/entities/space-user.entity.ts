import { SpaceMember } from './space-member.entity'

export class SpaceUser {
  readonly id: string
  readonly name?: string
  readonly image?: string
  readonly spaceId: string
  readonly userId?: string
  readonly email: string
  readonly role: SpaceMember['role']
  readonly status: SpaceMember['status']
  readonly joinedAt?: Date

  constructor(params: {
    id: string
    name?: string
    image?: string
    spaceId: string
    userId?: string
    email: string
    role: SpaceMember['role']
    status: SpaceMember['status']
    joinedAt?: Date
  }) {
    this.id = params.id
    this.name = params.name
    this.image = params.image
    this.spaceId = params.spaceId
    this.userId = params.userId
    this.email = params.email
    this.role = params.role
    this.status = params.status
    this.joinedAt = params.joinedAt
  }
}
