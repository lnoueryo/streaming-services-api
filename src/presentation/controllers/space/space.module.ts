import { Module } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { GetPublicSpaceUseCase } from 'src/application/usecases/space/get-public-space.usecase'
import { CreateSpaceUseCase } from 'src/application/usecases/space/create-space.usecase'
import { SpaceController } from 'src/presentation/controllers/space/space.controller'
import { SpaceRepository } from 'src/infrastructure/repositories/space.repository'
import { prisma } from '../../../infrastructure/plugins/prisma'
import { EnterLobbyUseCase } from 'src/application/usecases/space/enter-lobby.usecase'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { SignalingGateway } from 'src/infrastructure/gateways/signaling.gateway'
import { SignalingHttpClient } from 'src/infrastructure/http/signaling-client'
import { EnterRoomUseCase } from 'src/application/usecases/space/enter-room.usecase'

@Module({
  controllers: [SpaceController],
  providers: [
    CreateSpaceUseCase,
    GetPublicSpaceUseCase,
    EnterLobbyUseCase,
    EnterRoomUseCase,
    SignalingHttpClient,
    {
      provide: ISpaceRepository,
      useClass: SpaceRepository
    },
    {
      provide: ISignalingGateway,
      useClass: SignalingGateway
    },
    {
      provide: 'PRISMA',
      useValue: prisma
    }
  ],
  exports: [ISpaceRepository, ISignalingGateway]
})
export class SpaceModule {}
