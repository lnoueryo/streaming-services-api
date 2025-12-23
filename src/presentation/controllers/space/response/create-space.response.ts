import { GetTargetSpaceResponse } from './get-target-space.response'

export class CreateSpaceResponse {
  space: GetTargetSpaceResponse
  url: string

  constructor(params: {
    space: {
      id: string
      name?: string
      privacy: string
    }
    url: string
  }) {
    this.space = params.space
    this.url = params.url
  }
}
