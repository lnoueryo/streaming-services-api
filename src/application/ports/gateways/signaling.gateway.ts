import { Room } from 'src/domain/entities/room.entity'

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  getRoom: (params: { spaceId: string }) => Promise<Room>
  removeParticipant: (params: {
    spaceId: string
    user: { id: string }
  }) => Promise<Room>
  requestEntry: (params: {
    spaceId: string
    spaceMember: {
      id: string
      spaceId: string
      userId: string
      email: string
      role: string
      status: string
    }
  }) => Promise<void>
  decideRequest: (params: {
    id: string
    spaceId: string
    userId: string
    email: string
    role: string
    status: string
  }) => Promise<void>
}
