import { SpaceMember } from 'src/domain/entities/space-member.entity'
import { IRepository } from './repository'

export const ISpaceMemberRepository = Symbol('ISpaceMemberRepository')

export type MemberStatus = 'approved' | 'pending' | 'rejected' | 'none'

export interface ISpaceMemberRepository extends IRepository<ISpaceMemberRepository> {
  find(id: string): Promise<SpaceMember | null>
  findMany(criteria: { spaceId?: string }): Promise<SpaceMember[]>
  findByEmail(params: {
    spaceId: string
    email: string
  }): Promise<SpaceMember | null>
  findByUserId(params: {
    spaceId: string
    userId: string
  }): Promise<SpaceMember | null>
  create(params: SpaceMember): Promise<SpaceMember>
  createMany(params: SpaceMember[]): Promise<void>
  update(params: SpaceMember): Promise<SpaceMember>
  upsert(params: SpaceMember): Promise<SpaceMember>
}
