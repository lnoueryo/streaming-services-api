import { Module } from '@nestjs/common'
import { RoomModule } from './presentation/controllers/room/room.module'
import { StreamingModule } from './presentation/controllers/streaming/streaming.module'

@Module({
  imports: [
    RoomModule,
    StreamingModule,
  ],
})
export class AppModule {}
