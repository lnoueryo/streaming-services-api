import { Module } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { GetPublicRoomUseCase } from 'src/application/usecases/room/get-public-room.usecase'
import { CreateRoomUseCase } from 'src/application/usecases/room/create-room.usecase'
import { RoomController } from 'src/presentation/controllers/room/room.controller'
import { RoomRepository } from 'src/infrastructure/repositories/room.repository'
import { prisma } from '../../../infrastructure/plugins/prisma'
import { EnterLobbyUseCase } from 'src/application/usecases/room/enter-lobby.usecase'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { SignalingGateway } from 'src/infrastructure/gateways/signaling.gateway'
import { SignalingHttpClient } from 'src/infrastructure/http/signaling-client'
import { EnterRoomUseCase } from 'src/application/usecases/room/enter-room.usecase'

@Module({
  controllers: [RoomController],
  providers: [
    CreateRoomUseCase,
    GetPublicRoomUseCase,
    EnterLobbyUseCase,
    EnterRoomUseCase,
    SignalingHttpClient,
    {
      provide: IRoomRepository,
      useClass: RoomRepository,
    },
    {
      provide: ISignalingGateway,
      useClass: SignalingGateway,
    },
    {
      provide: 'PRISMA',
      useValue: prisma,
    },
  ],
  exports: [
    IRoomRepository,
    ISignalingGateway,
  ],
})
export class RoomModule {}
