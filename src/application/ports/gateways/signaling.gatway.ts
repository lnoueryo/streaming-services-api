import { SignalingClient } from "src/domain/entities/signaling-client.entity"

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  checkIfCanJoin: (params: { roomId: string, user: { id: string, token: string } }) => Promise<SignalingClient | null>
  deleteRtcClient: (params: { roomId: string, user: { id: string, token: string } }) => Promise<void>
}