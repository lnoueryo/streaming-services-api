import { Injectable } from '@nestjs/common'
import { Room } from 'src/domain/entities/room.entity'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import { config } from 'src/config'
import { IRoomService } from 'src/application/ports/grpc/room.grpc'
import { SpaceMember } from 'src/domain/entities/space-member.entity'

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  private readonly roomService: IRoomService
  constructor(private factory: GrpcClientFactory) {
    this.roomService = this.factory.create<IRoomService>({
      url: config.signalingApiOrigin,
      protoPath: config.protoPath.signaling,
      package: 'signaling',
      serviceName: 'RoomService'
    })
  }

  async getRoom(params: { spaceId: string }): Promise<Room> {
    const response = await this.roomService.getRoom({
      spaceId: params.spaceId
    })
    return new Room(response)
  }

  async removeParticipant(params: {
    spaceId: string
    user: { id: string }
  }): Promise<Room> {
    const response = await this.roomService.removeParticipant({
      spaceId: params.spaceId,
      userId: params.user.id
    })
    return new Room(response)
  }

  async requestEntry(params: {
    spaceId: string
    spaceMember: SpaceMember
  }): Promise<void> {
    await this.roomService.requestEntry({
      spaceId: params.spaceId,
      spaceMember: {
        id: params.spaceMember.id,
        spaceId: params.spaceMember.spaceId,
        userId: params.spaceMember.userId,
        email: params.spaceMember.email,
        role: params.spaceMember.role,
        status: params.spaceMember.status
      }
    })
    return
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

  async acceptInvitation(params: {
    spaceId: string
    spaceMember: SpaceMember
  }): Promise<void> {
    await this.roomService.acceptInvitation({
      spaceId: params.spaceId,
      spaceMember: {
        id: params.spaceMember.id,
        spaceId: params.spaceMember.spaceId,
        userId: params.spaceMember.userId,
        email: params.spaceMember.email,
        role: params.spaceMember.role,
        status: params.spaceMember.status
      }
    })
    return
  }
}
