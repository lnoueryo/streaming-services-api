import { Module } from '@nestjs/common'
import { RoomModule } from './room.module'
import { StreamingModule } from './streaming.module'

@Module({
  imports: [
    RoomModule,
    StreamingModule,
  ],
})
export class AppModule {}
