import { SpaceMember } from 'src/domain/entities/space-member.entity'

export const ISignalingGateway = Symbol('ISignalingGateway')

export type ISignalingGateway = {
  decideRequest: (params: SpaceMember) => Promise<void>
}
