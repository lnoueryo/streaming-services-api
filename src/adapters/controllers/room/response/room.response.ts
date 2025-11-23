import { Room } from "src/domain/entities/room.entity";

export class RoomResponse {
  id: string;
  privacy: string;

  constructor(room: Room) {
    this.id = room.id;
    this.privacy = room.privacy;
  }
}