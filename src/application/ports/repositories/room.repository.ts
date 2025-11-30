import { Room } from "src/domain/entities/room.entity"

export const IRoomRepository = Symbol('IRoomRepository')

export type RoomWhere = {
  privacy?: 'public' | 'private'
}
export type FindRoomsParam = RoomWhere & {
  page: number
  limit: number
}
export type FindRoomParam = {
  id: string
}

export type IRoomRepository = {
  findRooms(params: FindRoomsParam): Promise<Room[]>
  findRoom(params: FindRoomParam): Promise<Room>
  countRooms(params: RoomWhere)
  create(): Promise<Room>
}