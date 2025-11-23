import { Room } from 'src/domain/entities/room.entity';
import { RoomResponse } from './room.response';

export class GetPublicRoomResponse {
  items: RoomResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  constructor(params: {
    rooms: Room[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }) {
    this.items = params.rooms.map(r => new RoomResponse(r));
    this.page = params.page;
    this.limit = params.limit;
    this.total = params.total;
    this.totalPages = params.totalPages;
  }
}