import { BaseEntity } from './base.entity'
import { User } from './user.entity'

export type SpacePrivacy = 'public' | 'private'
export class Space extends BaseEntity {
  readonly id: string
  readonly privacy: SpacePrivacy
  readonly users?: User[]

  constructor(params: {
    id: string
    privacy: SpacePrivacy
    users?: User[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    super(params)
    this.id = params.id
    this.privacy = params.privacy
    this.users = params?.users?.map((user) => new User(user)) || []
  }
}
