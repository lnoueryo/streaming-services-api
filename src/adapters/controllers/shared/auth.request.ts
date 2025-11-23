export class AuthUserRequest {
  public readonly id: string
  public readonly email: string
  public readonly name: string
  constructor(decodedIdToken: { uid: string, email?: string, displayName?: string}) {
    this.id = decodedIdToken.uid
    this.email = decodedIdToken.email
    this.name = decodedIdToken.displayName
  }
}