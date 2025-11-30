import { Module } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { GetPublicRoomUseCase } from 'src/application/usecases/room/get-public-room.usecase'
import { CreateRoomUseCase } from 'src/application/usecases/room/create-room.usecase'
import { RoomController } from 'src/presentation/controllers/room/room.controller'
import { RoomRepository } from 'src/infrastructure/repositories/room.repository'
import { prisma } from '../../../infrastructure/plugins/prisma'
@Module({
  controllers: [RoomController],
  providers: [
    CreateRoomUseCase,
    GetPublicRoomUseCase,
    {
      provide: IRoomRepository,
      useClass: RoomRepository,
    },
    {
      provide: 'PRISMA',
      useValue: prisma,
    },
  ],
  exports: [IRoomRepository],
})
export class RoomModule {}
