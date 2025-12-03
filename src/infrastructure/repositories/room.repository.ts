import { Inject, Injectable } from '@nestjs/common'
import { FindRoomsParam, FindRoomParam, RoomWhere, IRoomRepository } from 'src/application/ports/repositories/room.repository'
import { Room } from 'src/domain/entities/room.entity'
import { IPrismaClient } from 'src/infrastructure/plugins/prisma'

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(
    @Inject('PRISMA') private readonly prisma: IPrismaClient,
  ) {}
  async findRooms(params: FindRoomsParam) {
    const rooms = await this.prisma.room.findMany({
      where: { privacy: params.privacy },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' }
    })
    return rooms.map(room => new Room(room))
  }
  async findRoom(params: FindRoomParam): Promise<Room | null> {
    const room = await this.prisma.room.findFirst({
      where: {
        id: params.id
      }
    })
    return room ? new Room(room) : room
  }
  async countRooms(params: RoomWhere) {
    return await this.prisma.room.count({
      where: {
        privacy: params.privacy
      }
    })
  }
  async create() {
    const room = await this.prisma.room.create({
      data: {}
    })
    return new Room(room)
  }
}
