import { Module } from '@nestjs/common'
import { SpaceModule } from './presentation/controllers/space/space.module'
import { StreamingModule } from './presentation/controllers/streaming/streaming.module'

@Module({
  imports: [SpaceModule, StreamingModule]
})
export class AppModule {}
