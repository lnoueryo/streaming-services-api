import { Module } from '@nestjs/common'
import { SpaceModule } from './presentation/controllers/space/space.module'
import { StreamingModule } from './presentation/controllers/streaming/streaming.module'
import { SpaceMemberModule } from './presentation/controllers/space-member/space-member.module'

@Module({
  imports: [SpaceModule, SpaceMemberModule, StreamingModule]
})
export class AppModule {}
