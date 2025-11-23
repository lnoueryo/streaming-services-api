import { Module } from '@nestjs/common'
import { IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { GetPublicRoomUseCase } from 'src/application/usecases/room/get-public-room.usecase'
import { CreateRoomUseCase } from 'src/application/usecases/room/create-room.usecase'
import { RoomController } from 'src/adapters/controllers/room/room.controller'
import { RoomRepository } from 'src/adapters/repositories/room.repository'
import { prisma } from '../plugins/prisma'
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
