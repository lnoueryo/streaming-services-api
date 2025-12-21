export class RequestEntryResponse {
  role: string
  status: string

  constructor(params: { role: string; status: string }) {
    this.role = params.role
    this.status = params.status
  }
}
