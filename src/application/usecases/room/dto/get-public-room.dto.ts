import { Room } from 'src/domain/entities/room.entity'
import { GetTargetRoomDto } from './get-target-room.dto'

export class GetPublicRoomDto {
  rooms: GetTargetRoomDto[]
  page: number
  limit: number
  total: number
  totalPages: number
  constructor(
    params: {
        rooms: Room[],
        page: number,
        limit: number,
        total: number,
        totalPages: number,
    }
  ) {
    this.rooms = params.rooms.map(r => new GetTargetRoomDto(r));
    this.page = params.page;
    this.limit = params.limit;
    this.total = params.total;
    this.totalPages = params.totalPages;
  }
}