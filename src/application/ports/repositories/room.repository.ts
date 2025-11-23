import { Room } from "src/domain/entities/room.entity"

export const IRoomRepository = Symbol('IRoomRepository')

export type RoomWhere = {
  privacy?: 'public' | 'private'
}
export type FindRoomParam = RoomWhere & {
  page: number
  limit: number
}

export type IRoomRepository = {
  findRooms(params: FindRoomParam): Promise<Room[]>
  countRooms(params: RoomWhere)
  create(): Promise<Room>
}