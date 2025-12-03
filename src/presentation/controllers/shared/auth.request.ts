export class AuthUserRequest {
  public readonly id: string
  public readonly email: string
  public readonly name: string
  public readonly token: string
  public readonly session: string
  constructor(decodedIdToken: { id: string, email?: string, name?: string, token?: string, session?: string}) {
    this.id = decodedIdToken.id
    this.email = decodedIdToken.email
    this.name = decodedIdToken.name
    this.token = decodedIdToken.token
    this.session = decodedIdToken.session
  }
}