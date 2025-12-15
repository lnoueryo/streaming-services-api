import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import { CreateSpaceMemberParam } from './space-member.repository'

export const ISpaceRepository = Symbol('ISpaceRepository')

export type SpaceWhere = {
  privacy?: SpacePrivacy
}
export type FindSpacesParam = SpaceWhere & {
  page: number
  limit: number
}

export type CreateSpaceParam = {
  name?: string
  privacy: SpacePrivacy
  creatorId: string
  members?: Omit<CreateSpaceMemberParam, 'spaceId'>[]
}

export type ISpaceRepository = {
  findSpaces(params: FindSpacesParam): Promise<Space[]>
  findSpace(id: string): Promise<Space>
  countSpaces(params: SpaceWhere)
  create(params: CreateSpaceParam): Promise<Space>
}
