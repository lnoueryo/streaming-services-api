import { Room } from 'src/domain/entities/room.entity'

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  getRoom: (params: {
    spaceId: string
    user: { id: string; token: string }
  }) => Promise<Room>
  deleteRtcClient: (params: {
    spaceId: string
    user: { id: string; token: string }
  }) => Promise<Room>
}
