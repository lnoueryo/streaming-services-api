import { SignalingClient } from "./signaling-client.entity";

export class SignalingRoom {
  readonly id: string;
  readonly users: SignalingClient[];

  constructor(params: {
    id: string;
    users?: SignalingClient[]
  }) {
    this.id = params.id;
    this.users = params?.users?.map((user) => new SignalingClient(user)) || []
  }
}