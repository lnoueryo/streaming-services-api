import { Space } from 'src/domain/entities/space.entity'
import { GetTargetSpaceDto } from './get-target-space.dto'

export class GetPublicSpaceDto {
  spaces: GetTargetSpaceDto[]
  page: number
  limit: number
  total: number
  totalPages: number
  constructor(params: {
    spaces: Space[]
    page: number
    limit: number
    total: number
    totalPages: number
  }) {
    this.spaces = params.spaces.map((r) => new GetTargetSpaceDto(r))
    this.page = params.page
    this.limit = params.limit
    this.total = params.total
    this.totalPages = params.totalPages
  }
}
