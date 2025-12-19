import { Module } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { GetPublicSpaceUseCase } from 'src/application/usecases/space/get-public-space.usecase'
import { CreateSpaceUseCase } from 'src/application/usecases/space/create-space.usecase'
import { SpaceController } from 'src/presentation/controllers/space/space.controller'
import { SpaceRepository } from 'src/infrastructure/repositories/space.repository'
import { prisma } from '../../../infrastructure/plugins/prisma'
import { EnterLobbyUseCase } from 'src/application/usecases/space/enter-lobby.usecase'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gatway'
import { SignalingGateway } from 'src/infrastructure/gateways/http/signaling.gateway'
import { SignalingHttpClient } from 'src/infrastructure/http/signaling-client'
import { EnableEntryUseCase } from 'src/application/usecases/space/enable-entry.usecase'
import { AcceptSpaceInviteUseCase } from 'src/application/usecases/space/accept-space-invite.usecase'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMemberRepository } from 'src/infrastructure/repositories/space-member.repository'
import { JWTModule } from 'src/infrastructure/modules/jwt.module'

@Module({
  imports: [JWTModule],
  controllers: [SpaceController],
  providers: [
    CreateSpaceUseCase,
    AcceptSpaceInviteUseCase,
    GetPublicSpaceUseCase,
    EnterLobbyUseCase,
    EnableEntryUseCase,
    SignalingHttpClient,
    InviteSpaceService,
    {
      provide: ISpaceRepository,
      useClass: SpaceRepository
    },
    {
      provide: ISpaceMemberRepository,
      useClass: SpaceMemberRepository
    },
    {
      provide: ISignalingGateway,
      useClass: SignalingGateway
    },
    {
      provide: 'InviteSpaceService',
      useClass: InviteSpaceService
    },
    {
      provide: 'PRISMA',
      useValue: prisma
    }
  ],
  exports: [ISpaceRepository, ISignalingGateway]
})
export class SpaceModule {}
