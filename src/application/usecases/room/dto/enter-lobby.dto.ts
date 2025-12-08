import { RoomPrivacy } from "src/domain/entities/room.entity"
import { GetTargetRoomDto, GetTargetRoomUser } from "./get-target-room.dto"

export class EnterLobbyDto extends GetTargetRoomDto {
  readonly isJoined: boolean
  constructor(
    params: {
      id: string
      privacy: RoomPrivacy
      users?: GetTargetRoomUser[]
    },
    requestUser: {
      id: string
    }
  ) {
    super(params)
    this.isJoined = params.users?.some((user) => user.id === requestUser.id)
  }
}