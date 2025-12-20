import { Module } from '@nestjs/common'
import { SpaceModule } from './presentation/controllers/space/space.module'
import { StreamingModule } from './presentation/controllers/streaming/streaming.module'
import { SpaceMemberModule } from './presentation/controllers/space-member/space-member.module'
import { TestModule } from './test.module'

@Module({
  imports: [TestModule, SpaceModule, SpaceMemberModule, StreamingModule]
})
export class AppModule {}
