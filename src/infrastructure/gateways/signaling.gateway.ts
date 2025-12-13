import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { SignalingRoom } from 'src/domain/entities/signaling-room.entity';

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  constructor(
    @Inject('SIGNALING_HTTP_CLIENT') private readonly http: HttpService,
  ) { }
  async getRoom(params: { roomId: string, user: { id: string, token?: string, session?: string } }): Promise<SignalingRoom> {
    const resp = await this.http.axiosRef.get<{id: string}>(`/room/${params.roomId}/user`, {
      headers: {
        authorization: `Bearer ${params.user.token}`,
        cookie: `session=${params.user.session}`,
      }
    })
    return resp.data ? new SignalingRoom(resp.data) : null
  }
  async deleteRtcClient(params: { roomId: string, user: { id: string, token?: string, session?: string } }): Promise<SignalingRoom> {
    const resp = await this.http.axiosRef.get(`/room/${params.roomId}/user/delete`, {
      headers: {
        authorization: `Bearer ${params.user.token}`,
        cookie: `session=${params.user.session}`,
      }
    })
    return resp.data ? new SignalingRoom(resp.data) : null
  }
}
