import { Module } from '@nestjs/common'
import { StreamingController } from 'src/presentation/controllers/streaming/streaming.controller'
import { GenerateTurnCredentialUseCase } from 'src/application/usecases/streaming/generate-turn-credential.usecase'
@Module({
  controllers: [StreamingController],
  providers: [GenerateTurnCredentialUseCase]
})
export class StreamingModule {}
