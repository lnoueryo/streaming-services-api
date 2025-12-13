import { SignalingRoom } from "src/domain/entities/signaling-room.entity"

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  getRoom: (params: { roomId: string, user: { id: string, token: string } }) => Promise<SignalingRoom | null>
  deleteRtcClient: (params: { roomId: string, user: { id: string, token: string } }) => Promise<SignalingRoom | null>
}