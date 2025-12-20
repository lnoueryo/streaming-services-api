import { Inject, Injectable } from '@nestjs/common'
import {
  FindSpacesParam,
  SpaceWhere,
  ISpaceRepository
} from 'src/application/ports/repositories/space.repository'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { Space } from 'src/domain/entities/space.entity'
import { IPrismaClient, PrismaFactory } from 'src/infrastructure/plugins/prisma'

@Injectable()
export class SpaceRepository implements ISpaceRepository {
  private readonly prisma: IPrismaClient
  constructor(private readonly factory: PrismaFactory) {
    this.prisma = this.factory.create()
  }
  async findSpaces(params: FindSpacesParam) {
    const spaces = await this.prisma.space.findMany({
      where: { privacy: params.privacy },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { createdAt: 'desc' }
    })
    return spaces.map((space) => new Space(space))
  }
  async findSpace(id: string): Promise<Space | null> {
    const space = await this.prisma.space.findUnique({
      where: {
        id
      },
      include: {
        spaceMembers: true
      }
    })
    if (!space) {
      return null
    }
    const spaceMembers =
      space.spaceMembers?.map((member) => {
        return new SpaceMember(member)
      }) || []
    return new Space({
      ...space,
      spaceMembers
    })
  }
  async countSpaces(params: SpaceWhere) {
    return await this.prisma.space.count({
      where: {
        privacy: params.privacy
      }
    })
  }
  async create(params: Space): Promise<Space> {
    const space = await this.prisma.space.create({
      data: {
        id: params.id,
        name: params.name || null,
        privacy: params.privacy,
        creatorId: params.creatorId,
        spaceMembers: {
          create:
            params.spaceMembers.map((member) => ({
              userId: member.userId,
              email: member.email,
              role: member.role,
              status: member.status
            })) || []
        }
      }
    })
    return new Space(space)
  }
}
