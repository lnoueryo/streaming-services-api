export class DecideRequestResponse {
  id: number
  role: string
  status: string

  constructor(params: { id: number; role: string; status: string }) {
    this.id = params.id
    this.role = params.role
    this.status = params.status
  }
}
