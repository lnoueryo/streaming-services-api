import { Room, RoomPrivacy } from "src/domain/entities/room.entity"

export class GetTargetRoomDto {
  id: string
  privacy: RoomPrivacy
  constructor(
    params: Room
  ) {
    this.id = params.id
    this.privacy = params.privacy
  }
}