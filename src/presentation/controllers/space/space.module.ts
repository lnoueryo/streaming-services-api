import { Module } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { GetPublicSpaceUseCase } from 'src/application/usecases/space/get-public-space.usecase'
import { CreateSpaceUseCase } from 'src/application/usecases/space/create-space.usecase'
import { SpaceController } from 'src/presentation/controllers/space/space.controller'
import { SpaceRepository } from 'src/infrastructure/repositories/space.repository'
import { PrismaService } from '../../../infrastructure/plugins/prisma'
import { EnterLobbyUseCase } from 'src/application/usecases/space/enter-lobby.usecase'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { SignalingGateway } from 'src/infrastructure/gateways/grpc/signaling.gateway'
import { EnableEntryUseCase } from 'src/application/usecases/space/enable-entry.usecase'
import { AcceptSpaceInviteUseCase } from 'src/application/usecases/space/accept-space-invite.usecase'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMemberRepository } from 'src/infrastructure/repositories/space-member.repository'
import { AxiosFactory } from 'src/infrastructure/plugins/axios'
import { JwtFactory } from 'src/infrastructure/plugins/jwt'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'
import { MediaGateway } from 'src/infrastructure/gateways/grpc/media.gateway'
import { GetTargetSpaceUseCase } from 'src/application/usecases/space/get-target-space.usecase'
import { MailjetService } from 'src/infrastructure/services/email/mailjet.service'
import { MailjetFactory } from 'src/infrastructure/plugins/mailjet'
import { IEmailService } from 'src/application/ports/services/email.service'
import { InviteSpaceUseCase } from 'src/application/usecases/space/invite-space.usecase'

@Module({
  controllers: [SpaceController],
  providers: [
    CreateSpaceUseCase,
    GetTargetSpaceUseCase,
    AcceptSpaceInviteUseCase,
    GetPublicSpaceUseCase,
    EnterLobbyUseCase,
    EnableEntryUseCase,
    InviteSpaceUseCase,
    AxiosFactory,
    MailjetFactory,
    PrismaService,
    JwtFactory,
    GrpcClientFactory,
    InviteSpaceService,
    MailjetService,
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
      provide: IMediaGateway,
      useClass: MediaGateway
    },
    {
      provide: IEmailService,
      useClass: MailjetService
    }
  ],
  exports: [ISpaceRepository, ISignalingGateway, IMediaGateway]
})
export class SpaceModule {}
