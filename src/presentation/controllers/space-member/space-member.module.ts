import { Module } from '@nestjs/common'
import { PrismaFactory } from '../../../infrastructure/plugins/prisma'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMemberRepository } from 'src/infrastructure/repositories/space-member.repository'
import { SpaceMemberController } from './space-member.controller'
import { RequestEntryUseCase } from 'src/application/usecases/space-member/request-entry.usecase'
import { DecideRequestUseCase } from 'src/application/usecases/space-member/decide-request.usecase'
import { EntryRequestDecisionService } from 'src/domain/services/space-member/entry-request-decision.service'

@Module({
  controllers: [SpaceMemberController],
  providers: [
    RequestEntryUseCase,
    DecideRequestUseCase,
    EntryRequestDecisionService,
    PrismaFactory,
    {
      provide: ISpaceMemberRepository,
      useClass: SpaceMemberRepository
    },
    {
      provide: 'EntryRequestDecisionService',
      useClass: EntryRequestDecisionService
    },
  ],
  exports: [ISpaceMemberRepository]
})
export class SpaceMemberModule {}
