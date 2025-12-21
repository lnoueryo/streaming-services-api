export class GetSpaceMemberResponse {
  readonly spaceMembers

  constructor(
    params: {
      id: number
      spaceId: string
      userId?: string
      email: string
      role: string
      status: string
      joinedAt?: Date
    }[]
  ) {
    this.spaceMembers = params
  }
}
