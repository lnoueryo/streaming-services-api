import { BaseEntity } from "./base.entity"

export class User extends BaseEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly image: string;

  constructor(params: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(params);
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
    this.image = params.image;
  }
}