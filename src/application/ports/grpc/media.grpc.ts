import { Room } from "src/domain/entities/room.entity"

export const IMediaService = Symbol('IMediaService')

type Participant = {
  id: string
  name: string
  email: string
  image: string
}

export type IMediaService = {
  getRoom(params: { spaceId: string }): Promise<{
    id: string
    participants: Participant[]
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
  createPeer(params: {
    spaceId: string
    spaceMember: {
      id: string
      spaceId: string
      userId?: string | null
      email: string
      role: string
      status: string
    }
    user: { id: string; name: string; email: string; image: string }
  }): Promise<Room>
}
