import { Injectable } from '@nestjs/common'
import { Room } from 'src/domain/entities/room.entity'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import { config } from 'src/config'
import { ISignalingService } from 'src/application/ports/grpc/signaling.grpc'
import { SpaceMember } from 'src/domain/entities/space-member.entity'

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  private readonly roomService: ISignalingService
  constructor(private factory: GrpcClientFactory) {
    this.roomService = this.factory.create<ISignalingService>({
      url: config.signalingApiOrigin,
      protoPath: config.protoPath.signaling,
      package: 'signaling',
      serviceName: 'SignalingService'
    })
  }

  async decideRequest(params: SpaceMember): Promise<void> {
    await this.roomService.decideRequest({
      id: params.id,
      spaceId: params.spaceId,
      userId: params.userId,
      email: params.email,
      role: params.role,
      status: params.status
    })
    return
  }
}
