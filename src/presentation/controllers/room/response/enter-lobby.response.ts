import { EnterLobbyDto } from "src/application/usecases/room/dto/enter-lobby.dto";

export class EnterLobbyResponse {
  id: string;
  privacy: string;
  users: EnterLobbyDto['users'];
  isJoined: boolean

  constructor(room: EnterLobbyDto) {
    this.id = room.id;
    this.privacy = room.privacy;
    this.users = room.users;
    this.isJoined = room.isJoined;
  }
}