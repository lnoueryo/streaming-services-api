import { GetPublicRoomDto } from "src/application/usecases/room/dto/get-public-room.dto";
import { GetTargetRoomResponse } from "./get-target-room.response";

export class GetPublicRoomResponse {
  items: GetTargetRoomResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  constructor(params: GetPublicRoomDto) {
    this.items = params.rooms.map(r => new GetTargetRoomResponse(r));
    this.page = params.page;
    this.limit = params.limit;
    this.total = params.total;
    this.totalPages = params.totalPages;
  }
}