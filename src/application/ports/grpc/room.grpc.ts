export const IRoomService = Symbol('IRoomService')

type Participant = {
  id: string
  name: string
  email: string
  image: string
}

export type IRoomService = {
  getRoom(params: {
    spaceId: string,
  }): Promise<{
    id: string
    participants: {
      id: string;
      name: string;
      email: string;
      image: string;
    }[]
  }>
  removeParticipant(params: {
    spaceId: string,
    userId: string,
  }): Promise<{
    id: string
    participants: Participant[]
  }>
}
