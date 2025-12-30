export class GetSpaceMemberResponse {
  readonly spaceMembers

  constructor(
    params: {
      id: string
      name?: string
      image?: string
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
