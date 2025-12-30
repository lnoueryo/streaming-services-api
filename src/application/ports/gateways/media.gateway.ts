import { Room } from 'src/domain/entities/room.entity'
import { SpaceUser } from 'src/domain/entities/space-user.entity'

export const IMediaGateway = Symbol('IMediaGateway')

export type IMediaGateway = {
  getRoom: (params: { spaceId: string }) => Promise<Room>
  removeParticipant: (params: {
    spaceId: string
    user: { id: string }
  }) => Promise<Room>
  changeMemberState: (params: {
    spaceId: string
    spaceUser: SpaceUser
  }) => Promise<void>
  createPeer: (params: {
    spaceId: string
    spaceUser: SpaceUser
    user: { id: string; name: string; email: string; image: string }
  }) => Promise<Room>
}
