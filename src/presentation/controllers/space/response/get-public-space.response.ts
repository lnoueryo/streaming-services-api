import { GetTargetSpaceResponse } from './get-target-space.response'

export class GetPublicSpaceResponse {
  items: GetTargetSpaceResponse[]
  page: number
  limit: number
  total: number
  totalPages: number

  constructor(params: {
    spaces: {
      id: string
      name?: string
      privacy: string
      creatorId: string
      spaceMembers: {
        id: string
        spaceId: string
        userId?: string
        email: string
        role: string
        status: string
      }[]
    }[]
    page: number
    limit: number
    total: number
    totalPages: number
  }) {
    this.items = params.spaces.map((s) => new GetTargetSpaceResponse(s))
    this.page = params.page
    this.limit = params.limit
    this.total = params.total
    this.totalPages = params.totalPages
  }
}
