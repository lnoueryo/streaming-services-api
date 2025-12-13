import { GetPublicSpaceDto } from 'src/application/usecases/space/dto/get-public-space.dto'
import { GetTargetSpaceResponse } from './get-target-space.response'

export class GetPublicSpaceResponse {
  items: GetTargetSpaceResponse[]
  page: number
  limit: number
  total: number
  totalPages: number

  constructor(params: GetPublicSpaceDto) {
    this.items = params.spaces.map((s) => new GetTargetSpaceResponse(s))
    this.page = params.page
    this.limit = params.limit
    this.total = params.total
    this.totalPages = params.totalPages
  }
}
