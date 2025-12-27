export class AcceptSpaceInviteResponse {
  space: {
    id: string
    name?: string
    privacy: string
  }
  redirect: string

  constructor(params: {
    space: {
      id: string
      name?: string
      privacy: string
    }
    redirect: string
  }) {
    this.space = params.space
    this.redirect = params.redirect
  }
}
