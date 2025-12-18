export class GetTargetSpaceResponse {
  id: string
  name?: string
  privacy: string

  constructor(params: { id: string; name?: string; privacy: string }) {
    this.id = params.id
    this.name = params.name
    this.privacy = params.privacy
  }
}
