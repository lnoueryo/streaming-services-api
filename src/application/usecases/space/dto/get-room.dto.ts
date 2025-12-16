import { SpacePrivacy } from 'src/domain/entities/space.entity'

export type Participant = {
  id: string
  name: string
  email: string
  image: string
}

export class GetRoomDto {
  readonly id: string
  readonly privacy: SpacePrivacy
  readonly participants: Participant[]
  readonly isParticipated: boolean
  constructor(params: {
    id: string
    privacy: SpacePrivacy
    participants: Participant[]
    isParticipated: boolean
  }) {
    this.id = params.id
    this.privacy = params.privacy
    this.participants = params.participants
    this.isParticipated = params.isParticipated
  }
}
