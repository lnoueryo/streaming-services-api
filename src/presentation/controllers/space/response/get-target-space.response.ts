export class GetTargetSpaceResponse {
  id: string
  name?: string | null
  privacy: string

  constructor(params: { id: string; name?: string | null; privacy: string }) {
    this.id = params.id
    this.name = params.name
    this.privacy = params.privacy
  }
}
