export class DecideRequestResponse {
  id: string
  role: string
  status: string

  constructor(params: { id: string; role: string; status: string }) {
    this.id = params.id
    this.role = params.role
    this.status = params.status
  }
}
