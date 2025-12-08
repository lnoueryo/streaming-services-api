import {  RoomPrivacy } from "src/domain/entities/room.entity"

export type GetTargetRoomUser = {
  id: string
  name: string
  email: string
  image: string
}

export class GetTargetRoomDto {
  id: string
  privacy: RoomPrivacy
  users: GetTargetRoomUser[]
  constructor(
    params: {
      id: string
      privacy: RoomPrivacy
      users?: GetTargetRoomUser[]
    }
  ) {
    this.id = params.id
    this.privacy = params.privacy
    this.users = params?.users?.map((user) => {
      const {
        id,
        name,
        email,
        image,
      } = user
      return {
        id,
        name,
        email,
        image,
      }
    }) || []
  }
}