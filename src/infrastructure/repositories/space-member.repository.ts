import { Injectable } from '@nestjs/common'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { PrismaService } from 'src/infrastructure/plugins/prisma'

@Injectable()
export class SpaceMemberRepository implements ISpaceMemberRepository {
  constructor(private readonly prisma: PrismaService) {}
  async find(id: string): Promise<SpaceMember | null> {
    const spaceMember = await this.prisma.spaceMember.findUnique({
      where: {
        id
      }
    })
    return spaceMember ? new SpaceMember(spaceMember) : null
  }
  async findMany(criteria: { spaceId?: string }): Promise<SpaceMember[]> {
    const spaceMembers = await this.prisma.spaceMember.findMany({
      where: {
        spaceId: criteria.spaceId
      }
    })
    return spaceMembers.map((spaceMember) => new SpaceMember(spaceMember))
  }
  async findByEmail(params: {
    spaceId: string
    email: string
  }): Promise<SpaceMember | null> {
    const spaceMember = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_email: {
          spaceId: params.spaceId,
          email: params.email
        }
      }
    })
    return spaceMember ? new SpaceMember(spaceMember) : null
  }
  async findByUserId(params: {
    spaceId: string
    userId: string
  }): Promise<SpaceMember | null> {
    const spaceMember = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId: params.spaceId,
          userId: params.userId
        }
      }
    })
    return spaceMember ? new SpaceMember(spaceMember) : null
  }
  async create(params: SpaceMember): Promise<SpaceMember> {
    const spaceMember = await this.prisma.spaceMember.create({
      data: {
        id: params.id,
        spaceId: params.spaceId,
        userId: params.userId,
        email: params.email,
        role: params.role
      }
    })
    return new SpaceMember(spaceMember)
  }
  async createMany(params: SpaceMember[]): Promise<void> {
    await this.prisma.spaceMember.createMany({
      data: params.map((member) => ({
        id: member.id,
        spaceId: member.spaceId,
        userId: member.userId,
        email: member.email,
        role: member.role,
        status: member.status
      }))
    })
  }
  async update(spaceMember: SpaceMember): Promise<SpaceMember> {
    const updatedSpaceMember = await this.prisma.spaceMember.update({
      where: {
        spaceId_email: {
          spaceId: spaceMember.spaceId,
          email: spaceMember.email
        }
      },
      data: {
        userId: spaceMember.userId,
        role: spaceMember.role,
        status: spaceMember.status,
        joinedAt: spaceMember.joinedAt
      }
    })
    return new SpaceMember(updatedSpaceMember)
  }
  async upsert(params: SpaceMember): Promise<SpaceMember> {
    const spaceMember = await this.prisma.spaceMember.upsert({
      where: {
        spaceId_email: {
          spaceId: params.spaceId,
          email: params.email
        }
      },
      update: {
        userId: params.userId,
        role: params.role,
        status: params.status,
        joinedAt: params.joinedAt
      },
      create: {
        id: params.id,
        spaceId: params.spaceId,
        email: params.email,
        userId: params.userId,
        role: params.role,
        status: params.status,
        joinedAt: params.joinedAt
      }
    })
    return new SpaceMember(spaceMember)
  }
  transaction(tx: PrismaService) {
    return new SpaceMemberRepository(tx)
  }
}
