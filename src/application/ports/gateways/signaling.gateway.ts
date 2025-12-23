import { Room } from 'src/domain/entities/room.entity'
import { SpaceMember } from 'src/domain/entities/space-member.entity'

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  getRoom: (params: { spaceId: string }) => Promise<Room>
  removeParticipant: (params: {
    spaceId: string
    user: { id: string }
  }) => Promise<Room>
  requestEntry: (params: {
    spaceId: string
    spaceMember: SpaceMember
  }) => Promise<void>
  decideRequest: (params: SpaceMember) => Promise<void>
  acceptInvitation: (params: {
    spaceId: string
    spaceMember: SpaceMember
  }) => Promise<void>
}
