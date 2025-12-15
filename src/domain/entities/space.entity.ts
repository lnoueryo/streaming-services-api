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
}
