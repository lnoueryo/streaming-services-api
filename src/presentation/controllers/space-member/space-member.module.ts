import { Module } from '@nestjs/common'
import { PrismaFactory } from '../../../infrastructure/plugins/prisma'
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

@Module({
  controllers: [SpaceMemberController],
  providers: [
    RequestEntryUseCase,
    DecideRequestUseCase,
    GetSpaceMemberUseCase,
    GetTargetSpaceMemberUseCase,
    EntryRequestDecisionService,
    GrpcClientFactory,
    JwtFactory,
    PrismaFactory,
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
    }
  ],
  exports: [ISpaceMemberRepository, ISignalingGateway]
})
export class SpaceMemberModule {}
