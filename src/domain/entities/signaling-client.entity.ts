export class SignalingClient {
  readonly id: string;

  constructor(params: {
    id: string;
  }) {
    this.id = params.id;
  }
}