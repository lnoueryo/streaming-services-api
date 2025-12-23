export const IRoomService = Symbol('IRoomService')

type Participant = {
  id: string
  name: string
  email: string
  image: string
}

export type IRoomService = {
  getRoom(params: { spaceId: string }): Promise<{
    id: string
    participants: {
      id: string
      name: string
      email: string
      image: string
    }[]
  }>
  removeParticipant(params: { spaceId: string; userId: string }): Promise<{
    id: string
    participants: Participant[]
  }>
  requestEntry(params: {
    spaceId: string
    spaceMember: {
      id: string
      spaceId: string
      userId?: string | null
      email: string
      role: string
      status: string
    }
  }): Promise<void>
  decideRequest(params: {
    id: string
    spaceId: string
    userId?: string | null
    email: string
    role: string
    status: string
  }): Promise<void>
  acceptInvitation(params: {
    spaceId: string
    spaceMember: {
      id: string
      spaceId: string
      userId?: string | null
      email: string
      role: string
      status: string
    }
  }): Promise<void>
}
