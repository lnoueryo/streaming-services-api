import { Inject, Injectable } from '@nestjs/common'
import {
  FindSpacesParam,
  FindSpaceParam,
  SpaceWhere,
  ISpaceRepository
} from 'src/application/ports/repositories/space.repository'
import { Space } from 'src/domain/entities/space.entity'
import { IPrismaClient } from 'src/infrastructure/plugins/prisma'

@Injectable()
export class SpaceRepository implements ISpaceRepository {
  constructor(@Inject('PRISMA') private readonly prisma: IPrismaClient) {}
  async findSpaces(params: FindSpacesParam) {
    const spaces = await this.prisma.space.findMany({
      where: { privacy: params.privacy },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' }
    })
    return spaces.map((space) => new Space(space))
  }
  async findSpace(params: FindSpaceParam): Promise<Space | null> {
    const space = await this.prisma.space.findFirst({
      where: {
        id: params.id
      }
    })
    return space ? new Space(space) : space
  }
  async countSpaces(params: SpaceWhere) {
    return await this.prisma.space.count({
      where: {
        privacy: params.privacy
      }
    })
  }
  async create() {
    const space = await this.prisma.space.create({
      data: {}
    })
    return new Space(space)
  }
}
