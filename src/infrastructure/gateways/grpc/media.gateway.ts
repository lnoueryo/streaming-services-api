import { Injectable } from '@nestjs/common'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import { config } from 'src/config'
import { IMediaService } from 'src/application/ports/grpc/media.grpc'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { Room } from 'src/domain/entities/room.entity'
import { SpaceUser } from 'src/domain/entities/space-user.entity'

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

  async changeMemberState(params: {
    spaceId: string
    spaceUser: SpaceUser
  }): Promise<void> {
    await this.mediaService.changeMemberState({
      spaceId: params.spaceId,
      spaceUser: {
        id: params.spaceUser.id,
        name: params.spaceUser.name,
        image: params.spaceUser.image,
        spaceId: params.spaceUser.spaceId,
        userId: params.spaceUser.userId,
        email: params.spaceUser.email,
        role: params.spaceUser.role,
        status: params.spaceUser.status
      }
    })
    return
  }

  async createPeer(params: {
    spaceId: string
    spaceUser: SpaceUser
    user: { id: string; name: string; email: string; image: string }
  }): Promise<Room> {
    const res = await this.mediaService.createPeer({
      spaceId: params.spaceId,
      spaceUser: {
        id: params.spaceUser.id,
        spaceId: params.spaceUser.spaceId,
        userId: params.spaceUser.userId,
        email: params.spaceUser.email,
        role: params.spaceUser.role,
        status: params.spaceUser.status
      },
      user: params.user
    })
    return new Room(res)
  }
}
