import { BaseEntity } from "./base.entity";
type RoomPrivacy = 'public' | 'private'
export class Room extends BaseEntity {
  readonly id: string;
  readonly privacy: RoomPrivacy;

  constructor(params: {
    id: string;
    privacy: RoomPrivacy;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params);
    this.id = params.id;
    this.privacy = params.privacy;
  }
}