import { SignalingClient } from "./signaling-client.entity";

export class SignalingRoom {
  readonly id: string;
  readonly clients: SignalingClient[];

  constructor(params: {
    id: string;
  }) {
    this.id = params.id;
  }
}