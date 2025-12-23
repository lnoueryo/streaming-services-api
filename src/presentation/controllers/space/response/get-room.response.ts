import { GetRoomDto } from 'src/application/usecases/space/dto/get-room.dto'

export class GetRoomResponse {
  id: string
  privacy: string
  membership: GetRoomDto['membership']
  participants: GetRoomDto['participants']
  isParticipated: boolean
  invitationToken?: string

  constructor(params: GetRoomDto) {
    this.id = params.id
    this.privacy = params.privacy
    this.membership = {
      role: params.membership.role,
      status: params.membership.status
    }
    this.participants = params.participants
    this.isParticipated = params.isParticipated
    this.invitationToken = params.invitationToken
  }
}
