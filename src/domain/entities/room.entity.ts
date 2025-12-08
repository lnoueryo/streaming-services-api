import { BaseEntity } from "./base.entity"
import { User } from "./user.entity";

export type RoomPrivacy = 'public' | 'private'
export class Room extends BaseEntity {
  readonly id: string;
  readonly privacy: RoomPrivacy;
  readonly users?: User[];

  constructor(params: {
    id: string;
    privacy: RoomPrivacy;
    users?: User[]
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params);
    this.id = params.id;
    this.privacy = params.privacy;
    this.users = params?.users?.map((user) => new User(user)) || []
  }
}