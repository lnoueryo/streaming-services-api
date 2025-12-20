import { Room } from 'src/domain/entities/room.entity'

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  getRoom: (params: {
    spaceId: string
  }) => Promise<Room>
  removeParticipant: (params: {
    spaceId: string
    user: { id: string }
  }) => Promise<Room>
}
