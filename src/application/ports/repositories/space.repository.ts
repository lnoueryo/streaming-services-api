import { Space } from 'src/domain/entities/space.entity'

export const ISpaceRepository = Symbol('ISpaceRepository')

export type SpaceWhere = {
  privacy?: 'public' | 'private'
}
export type FindSpacesParam = SpaceWhere & {
  page: number
  limit: number
}
export type FindSpaceParam = {
  id: string
}

export type ISpaceRepository = {
  findSpaces(params: FindSpacesParam): Promise<Space[]>
  findSpace(params: FindSpaceParam): Promise<Space>
  countSpaces(params: SpaceWhere)
  create(): Promise<Space>
}
