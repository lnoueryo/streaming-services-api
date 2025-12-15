import { Inject, Injectable } from '@nestjs/common'
import {
  CreateSpaceMemberParam,
  ISpaceMemberRepository,
  UpdateSpaceMemberParam
} from 'src/application/ports/repositories/space-member.repository'
import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { IPrismaClient } from 'src/infrastructure/plugins/prisma'

@Injectable()
export class SpaceMemberRepository implements ISpaceMemberRepository {
  constructor(@Inject('PRISMA') private readonly prisma: IPrismaClient) {}
  async create(params: CreateSpaceMemberParam): Promise<SpaceMember> {
    const spaceMember = await this.prisma.spaceMember.create({
      data: {
        spaceId: params.spaceId,
        userId: params.userId,
        email: params.email,
        role: params.role
      }
    })
    return new SpaceMember(spaceMember)
  }
  async update(params: UpdateSpaceMemberParam): Promise<SpaceMember> {
    const spaceMember = await this.prisma.spaceMember.update({
      where: {
        spaceId_email: {
          spaceId: params.spaceId,
          email: params.email
        }
      },
      data: {
        userId: params.userId,
        role: params.role,
        status: params.status,
        joinedAt: params.joinedAt
      }
    })
    return new SpaceMember(spaceMember)
  }
}
