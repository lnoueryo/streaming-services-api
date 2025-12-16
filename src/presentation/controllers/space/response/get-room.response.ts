import { GetRoomDto } from 'src/application/usecases/space/dto/get-room.dto'

export class GetRoomResponse {
  id: string
  privacy: string
  participants: GetRoomDto['participants']
  isParticipated: boolean

  constructor(space: GetRoomDto) {
    this.id = space.id
    this.privacy = space.privacy
    this.participants = space.participants
    this.isParticipated = space.isParticipated
  }
}
