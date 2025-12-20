import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'

export const ISpaceRepository = Symbol('ISpaceRepository')

export type SpaceWhere = {
  privacy?: SpacePrivacy
}
export type FindSpacesParam = SpaceWhere & {
  page: number
  limit: number
}

export type ISpaceRepository = {
  findSpaces(params: FindSpacesParam): Promise<Space[]>
  findSpace(id: string): Promise<Space | null>
  countSpaces(params: SpaceWhere): Promise<number>
  create(params: Space): Promise<Space>
}
