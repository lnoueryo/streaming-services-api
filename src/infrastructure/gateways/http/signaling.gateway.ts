import { Injectable } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import output from 'src/config'
import { Room } from 'src/domain/entities/room.entity'
import { AxiosFactory } from 'src/infrastructure/plugins/axios'

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  private readonly client: AxiosInstance

  constructor(private factory: AxiosFactory) {
    this.client = factory.create({
      baseURL: output.signalingApiOrigin,
    })
  }
  async getRoom(params: {
    spaceId: string
    user: { id: string; token?: string; session?: string }
  }): Promise<Room> {
    const resp = await this.client.get(`/room/${params.spaceId}/user`, {
      headers: {
        authorization: `Bearer ${params.user.token}`,
        cookie: `session=${params.user.session}`
      }
    })
    return new Room(resp.data)
  }
  async deleteRtcClient(params: {
    spaceId: string
    user: { id: string; token?: string; session?: string }
  }): Promise<Room> {
    const resp = await this.client.get(
      `/room/${params.spaceId}/user/delete`,
      {
        headers: {
          authorization: `Bearer ${params.user.token}`,
          cookie: `session=${params.user.session}`
        }
      }
    )
    return new Room(resp.data)
  }
}
