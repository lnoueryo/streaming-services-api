import {
  MemberRole,
  SpaceMember
} from 'src/domain/entities/space-member.entity'

export const ISpaceMemberRepository = Symbol('ISpaceMemberRepository')

export type MemberStatus = 'approved' | 'pending' | 'rejected' | 'none'

export type CreateSpaceMemberParam = {
  spaceId: string
  userId?: string
  email: string
  role: MemberRole
  status: MemberStatus
}

export type UpdateSpaceMemberParam = {
  spaceId: string
  userId?: string
  email: string
  role?: MemberRole
  status?: MemberStatus
  joinedAt?: Date
}

export type ISpaceMemberRepository = {
  find(id: number): Promise<SpaceMember | null>
  findMany(criteria: { spaceId?: string }): Promise<SpaceMember[]>
  findByEmail(params: {
    spaceId: string
    email: string
  }): Promise<SpaceMember | null>
  create(params: CreateSpaceMemberParam): Promise<SpaceMember>
  update(params: UpdateSpaceMemberParam): Promise<SpaceMember>
  upsert(params: SpaceMember): Promise<SpaceMember>
}
