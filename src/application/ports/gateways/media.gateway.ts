import { Room } from 'src/domain/entities/room.entity'
import { SpaceMember } from 'src/domain/entities/space-member.entity'

export const IMediaGateway = Symbol('IMediaGateway')

export type IMediaGateway = {
  getRoom: (params: { spaceId: string }) => Promise<Room>
  removeParticipant: (params: {
    spaceId: string
    user: { id: string }
  }) => Promise<Room>
  changeMemberState: (params: {
    spaceId: string
    spaceMember: SpaceMember
  }) => Promise<void>
  createPeer: (params: {
    spaceId: string
    spaceMember: SpaceMember
    user: { id: string; name: string; email: string; image: string }
  }) => Promise<Room>
}
