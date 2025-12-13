import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { Room } from 'src/domain/entities/room.entity'

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  constructor(
    @Inject('SIGNALING_HTTP_CLIENT') private readonly http: HttpService
  ) {}
  async getRoom(params: {
    spaceId: string
    user: { id: string; token?: string; session?: string }
  }): Promise<Room> {
    const resp = await this.http.axiosRef.get(
      `/room/${params.spaceId}/user`,
      {
        headers: {
          authorization: `Bearer ${params.user.token}`,
          cookie: `session=${params.user.session}`
        }
      }
    )
    return resp.data ? new Room(resp.data) : null
  }
  async deleteRtcClient(params: {
    spaceId: string
    user: { id: string; token?: string; session?: string }
  }): Promise<Room> {
    const resp = await this.http.axiosRef.get(
      `/room/${params.spaceId}/user/delete`,
      {
        headers: {
          authorization: `Bearer ${params.user.token}`,
          cookie: `session=${params.user.session}`
        }
      }
    )
    return resp.data ? new Room(resp.data) : null
  }
}
