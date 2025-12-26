import { Injectable } from '@nestjs/common'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import { config } from 'src/config'
import { IMediaService } from 'src/application/ports/grpc/media.grpc'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { Room } from 'src/domain/entities/room.entity'

@Injectable()
export class MediaGateway implements IMediaGateway {
  private readonly mediaService: IMediaService
  constructor(private factory: GrpcClientFactory) {
    this.mediaService = this.factory.create<IMediaService>({
      url: config.mediaApiOrigin,
      protoPath: config.protoPath.media,
      package: 'media',
      serviceName: 'MediaService'
    })
  }

  async getRoom(params: { spaceId: string }): Promise<Room> {
    const response = await this.mediaService.getRoom({
      spaceId: params.spaceId
    })
    return new Room(response)
  }

  async removeParticipant(params: {
    spaceId: string
    user: { id: string }
  }): Promise<Room> {
    const response = await this.mediaService.removeParticipant({
      spaceId: params.spaceId,
      userId: params.user.id
    })
    return new Room(response)
  }

  async requestEntry(params: {
    spaceId: string
    spaceMember: SpaceMember
  }): Promise<void> {
    await this.mediaService.requestEntry({
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

  async acceptInvitation(params: {
    spaceId: string
    spaceMember: SpaceMember
  }): Promise<void> {
    await this.mediaService.acceptInvitation({
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

  async createPeer(params: {
    spaceId: string
    spaceMember: SpaceMember
    user: { id: string; name: string; email: string; image: string }
  }): Promise<Room> {
    const res = await this.mediaService.createPeer({
      spaceId: params.spaceId,
      spaceMember: {
        id: params.spaceMember.id,
        spaceId: params.spaceMember.spaceId,
        userId: params.spaceMember.userId,
        email: params.spaceMember.email,
        role: params.spaceMember.role,
        status: params.spaceMember.status
      },
      user: params.user
    })
    return new Room(res)
  }
}
