import { Injectable } from '@nestjs/common'
import { Room } from 'src/domain/entities/room.entity'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import output from 'src/config'
import { IRoomService } from 'src/application/ports/grpc/room.grpc'

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  private readonly roomService: IRoomService
  constructor(private factory: GrpcClientFactory) {
    this.roomService = this.factory.create<IRoomService>({
      url: output.signalingApiOrigin,
      protoPath: output.protoPath,
      package: 'signaling',
      serviceName: 'RoomService',
    })
  }

  async getRoom(params: {
    spaceId: string
  }): Promise<Room> {
    const response = await this.roomService.getRoom({
      spaceId: params.spaceId,
    })
    return new Room(response)
  }

  async removeParticipant(params: {
    spaceId: string
    user: { id: string }
  }): Promise<Room> {
    const response = await this.roomService.removeParticipant({
      spaceId: params.spaceId,
      userId: params.user.id,
    })
    return new Room(response)
  }
}
