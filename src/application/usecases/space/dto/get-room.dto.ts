import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { SpacePrivacy } from 'src/domain/entities/space.entity'

export type Participant = {
  id: string
  name: string
  email: string
  image: string
}

export class GetRoomDto {
  readonly id: string
  readonly name?: string
  readonly privacy: SpacePrivacy
  readonly membership: {
    role: SpaceMember['role'],
    status: SpaceMember['status']
  }
  readonly participants: Participant[]
  readonly isParticipated: boolean
  constructor(params: {
    id: string
    name?: string
    privacy: SpacePrivacy
    membership: {
      role: SpaceMember['role'],
      status: SpaceMember['status']
    },
    participants: Participant[]
    isParticipated: boolean
  }) {
    this.id = params.id
    this.name = params.name
    this.privacy = params.privacy
    this.membership = params.membership
    this.participants = params.participants
    this.isParticipated = params.isParticipated
  }
}
