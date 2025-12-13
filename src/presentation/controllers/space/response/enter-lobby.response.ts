import { EnterLobbyDto } from 'src/application/usecases/space/dto/get-room.dto'

export class EnterLobbyResponse {
  id: string
  privacy: string
  users: EnterLobbyDto['users']
  isJoined: boolean

  constructor(space: EnterLobbyDto) {
    this.id = space.id
    this.privacy = space.privacy
    this.users = space.users
    this.isJoined = space.isJoined
  }
}
