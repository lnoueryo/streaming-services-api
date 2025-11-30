import { GetTargetRoomDto } from "src/application/usecases/room/dto/get-target-room.dto";

export class GetTargetRoomResponse {
  id: string;
  privacy: string;

  constructor(room: GetTargetRoomDto) {
    this.id = room.id;
    this.privacy = room.privacy;
  }
}