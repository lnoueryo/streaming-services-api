import { Module } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/plugins/prisma'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMemberRepository } from 'src/infrastructure/repositories/space-member.repository'
import { SpaceMemberController } from './space-member.controller'
import { RequestEntryUseCase } from 'src/application/usecases/space-member/request-entry.usecase'
import { DecideRequestUseCase } from 'src/application/usecases/space-member/decide-request.usecase'
import { EntryRequestDecisionService } from 'src/domain/services/space-member/entry-request-decision.service'
import { ISignalingGateway } from 'src/application/ports/gateways/signaling.gateway'
import { SignalingGateway } from 'src/infrastructure/gateways/grpc/signaling.gateway'
import { GrpcClientFactory } from 'src/infrastructure/plugins/micro-services'
import { JwtFactory } from 'src/infrastructure/plugins/jwt'
import { GetTargetSpaceMemberUseCase } from 'src/application/usecases/space-member/get-target-space-member.usecase'
import { GetSpaceMemberUseCase } from 'src/application/usecases/space-member/get-space-member.usecase'
import { InviteSpaceMemberUseCase } from 'src/application/usecases/space-member/invite-space-member.usecase'
import { MediaGateway } from 'src/infrastructure/gateways/grpc/media.gateway'
import { IMediaGateway } from 'src/application/ports/gateways/media.gateway'

@Module({
  controllers: [SpaceMemberController],
  providers: [
    RequestEntryUseCase,
    DecideRequestUseCase,
    GetSpaceMemberUseCase,
    GetTargetSpaceMemberUseCase,
    InviteSpaceMemberUseCase,
    EntryRequestDecisionService,
    GrpcClientFactory,
    JwtFactory,
    PrismaService,
    {
      provide: ISpaceMemberRepository,
      useClass: SpaceMemberRepository
    },
    {
      provide: 'EntryRequestDecisionService',
      useClass: EntryRequestDecisionService
    },
    {
      provide: ISignalingGateway,
      useClass: SignalingGateway
    },
    {
      provide: ISignalingGateway,
      useClass: SignalingGateway
    },
    {
      provide: IMediaGateway,
      useClass: MediaGateway
    }
  ],
  exports: [ISpaceMemberRepository, ISignalingGateway, IMediaGateway]
})
export class SpaceMemberModule {}
