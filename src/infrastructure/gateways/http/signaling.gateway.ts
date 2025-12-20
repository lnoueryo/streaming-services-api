import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AxiosInstance } from 'axios'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import output from 'src/config'
import { Room } from 'src/domain/entities/room.entity'
import { AxiosFactory } from 'src/infrastructure/plugins/axios'
import { JwtFactory } from 'src/infrastructure/plugins/jwt'

@Injectable()
export class SignalingGateway implements ISignalingGateway {
  private readonly client: AxiosInstance
  private readonly jwt: JwtService

  constructor(
    factory: AxiosFactory,
    jwtFactory: JwtFactory
  ) {
    this.client = factory.create({
      baseURL: output.signalingApiOrigin,
    })
    this.jwt = jwtFactory.create(output.signalingAuthJwt.secret, {
      expiresIn: output.signalingAuthJwt.config.expiresIn,
    })
  }
  async getRoom(params: {
    spaceId: string
  }): Promise<Room> {
    const resp = await this.client.get(`/room/${params.spaceId}/user`, {
      headers: {
        authorization: `Bearer ${this.createAuthToken()}`,
      }
    })
    return new Room(resp.data)
  }
  async removeParticipant(params: {
    spaceId: string
    user: { id: string; token?: string; session?: string }
  }): Promise<Room> {
    const resp = await this.client.get(
      `/room/${params.spaceId}/user/delete`,
      {
        headers: {
          authorization: `Bearer ${this.createAuthToken()}`,
        }
      }
    )
    return new Room(resp.data)
  }
  private createAuthToken(): string {
    return this.jwt.sign(
      {},
      {
        issuer: output.signalingAuthJwt.config.issuer,
        subject: output.signalingAuthJwt.config.subject,
        audience: output.signalingAuthJwt.config.audience,
      }
    )
  }
}
