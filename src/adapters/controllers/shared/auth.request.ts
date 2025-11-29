export class AuthUserRequest {
  public readonly id: string
  public readonly email: string
  public readonly name: string
  constructor(decodedIdToken: { id: string, email?: string, name?: string}) {
    this.id = decodedIdToken.id
    this.email = decodedIdToken.email
    this.name = decodedIdToken.name
  }
}