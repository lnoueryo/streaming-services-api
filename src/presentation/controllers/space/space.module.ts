import { Module } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { GetPublicSpaceUseCase } from 'src/application/usecases/space/get-public-space.usecase'
import { CreateSpaceUseCase } from 'src/application/usecases/space/create-space.usecase'
import { SpaceController } from 'src/presentation/controllers/space/space.controller'
import { SpaceRepository } from 'src/infrastructure/repositories/space.repository'
import { PrismaFactory } from '../../../infrastructure/plugins/prisma'
import { EnterLobbyUseCase } from 'src/application/usecases/space/enter-lobby.usecase'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { SignalingGateway } from 'src/infrastructure/gateways/http/signaling.gateway'
import { EnableEntryUseCase } from 'src/application/usecases/space/enable-entry.usecase'
import { AcceptSpaceInviteUseCase } from 'src/application/usecases/space/accept-space-invite.usecase'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMemberRepository } from 'src/infrastructure/repositories/space-member.repository'
import { JWTModule } from 'src/infrastructure/modules/jwt.module'
import { AxiosFactory } from 'src/infrastructure/plugins/axios'

@Module({
  imports: [JWTModule],
  controllers: [SpaceController],
  providers: [
    CreateSpaceUseCase,
    AcceptSpaceInviteUseCase,
    GetPublicSpaceUseCase,
    EnterLobbyUseCase,
    EnableEntryUseCase,
    AxiosFactory,
    PrismaFactory,
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
  ],
  exports: [ISpaceRepository, ISignalingGateway]
})
export class SpaceModule {}
