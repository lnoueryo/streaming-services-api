import { SpaceMember } from 'src/domain/entities/space-member.entity'

export const ISpaceMemberRepository = Symbol('ISpaceMemberRepository')

export type MemberStatus = 'approved' | 'pending' | 'rejected' | 'none'

export type ISpaceMemberRepository = {
  find(id: number): Promise<SpaceMember | null>
  findMany(criteria: { spaceId?: string }): Promise<SpaceMember[]>
  findByEmail(params: {
    spaceId: string
    email: string
  }): Promise<SpaceMember | null>
  create(params: SpaceMember): Promise<SpaceMember>
  update(params: SpaceMember): Promise<SpaceMember>
  upsert(params: SpaceMember): Promise<SpaceMember>
}
