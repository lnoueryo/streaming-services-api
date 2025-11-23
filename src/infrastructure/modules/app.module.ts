import { Module } from '@nestjs/common'
import { RoomModule } from './room.module'

@Module({
  imports: [RoomModule],
})
export class AppModule {}
