import { Participant } from './participant.entity'

export class Room {
  readonly id: string
  readonly participants: Participant[]

  constructor(params: { id: string; participants: Participant[] }) {
    this.id = params.id
    this.participants =
      params.participants.map((participant) => new Participant(participant)) ||
      []
  }
}
