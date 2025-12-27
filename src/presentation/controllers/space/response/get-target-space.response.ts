export class GetTargetSpaceResponse {
  id: string
  name?: string
  privacy: string
  creatorId: string
  spaceMembers?: {
    id: string
    spaceId: string
    userId?: string
    email: string
    role: string
    status: string
  }[]

  constructor(
    params:
    {
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
    }
  ) {
    this.id = params.id
    this.name = params.name
    this.privacy = params.privacy
    this.creatorId = params.creatorId
    this.spaceMembers = params.spaceMembers.map((member) => ({
      id: member.id,
      spaceId: member.spaceId,
      userId: member.userId || undefined,
      email: member.email,
      role: member.role,
      status: member.status
    }))
  }
}
