import { Module } from '@nestjs/common'
import { StreamingController } from 'src/presentation/controllers/streaming/streaming.controller'
import { GenerateTurnCredentialUseCase } from 'src/application/usecases/streaming/generate-turn-credential.usecase'
import { GetVideoUseCase } from 'src/application/usecases/streaming/get-video.usecase'
import { GetTargetVideoUseCase } from 'src/application/usecases/streaming/get-target-video.usecase'
import { DeleteTargetVideoUseCase } from 'src/application/usecases/streaming/delete-target-video.usecase'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { SpaceRepository } from 'src/infrastructure/repositories/space.repository'
import { StreamingRepository } from 'src/infrastructure/repositories/streaming.repository'
import { IStreamingRepository } from 'src/application/ports/repositories/streaming.repository'
import { PrismaService } from 'src/infrastructure/plugins/prisma'
@Module({
  controllers: [StreamingController],
  providers: [
    GenerateTurnCredentialUseCase,
    GetVideoUseCase,
    GetTargetVideoUseCase,
    DeleteTargetVideoUseCase,
    PrismaService,
    {
      provide: ISpaceRepository,
      useClass: SpaceRepository
    },
    {
      provide: IStreamingRepository,
      useClass: StreamingRepository
    }
  ],
  exports: [ISpaceRepository, IStreamingRepository]
})
export class StreamingModule {}
