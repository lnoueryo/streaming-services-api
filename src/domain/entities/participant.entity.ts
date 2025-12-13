export class Participant {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly image: string

  constructor(params: {
    id: string
    name: string
    email: string
    image: string
  }) {
    this.id = params.id
    this.name = params.name
    this.email = params.email
    this.image = params.image
  }
}
