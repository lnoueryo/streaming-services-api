import { GetTargetSpaceResponse } from './get-target-space.response'

export class AcceptSpaceInviteResponse {
  space: GetTargetSpaceResponse
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
