import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import { IRepository } from './repository'

export const ISpaceRepository = Symbol('ISpaceRepository')

export type SpaceWhere = {
  privacy?: SpacePrivacy
}
export type FindSpacesParam = SpaceWhere & {
  page: number
  limit: number
}

export interface ISpaceRepository extends IRepository<ISpaceRepository> {
  findSpaces(params: FindSpacesParam): Promise<Space[]>
  findSpace(id: string): Promise<Space | null>
  countSpaces(params: SpaceWhere): Promise<number>
  create(params: Space): Promise<Space>
}
