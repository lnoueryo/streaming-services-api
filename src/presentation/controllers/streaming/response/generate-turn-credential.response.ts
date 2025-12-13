export class GenerateTurnCredentialResponse {
  username: string
  credential: string
  ttl: number
  urls: string[]

  constructor(params: {
    username: string
    credential: string
    ttl: number
    urls: string[]
  }) {
    this.username = params.username
    this.credential = params.credential
    this.ttl = params.ttl
    this.urls = params.urls
  }
}
