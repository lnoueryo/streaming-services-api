import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  ValidateNested,
  IsArray
} from 'class-validator'
import { Type } from 'class-transformer'

export enum SpacePrivacy {
  public = 'public',
  protected = 'protected',
  private = 'private'
}

export enum SpaceRole {
  admin = 'admin',
  member = 'member'
}

class MemberRequest {
  @IsEmail({}, { message: '有効な email を指定してください' })
  readonly email!: string

  @IsEnum(SpaceRole, { message: 'role は admin | member のいずれかです' })
  readonly role!: SpaceRole
}

export class CreateSpaceRequest {
  @IsOptional()
  @IsString()
  readonly name?: string

  @IsEnum(SpacePrivacy, { message: 'privacy は public | private です' })
  readonly privacy!: SpacePrivacy

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberRequest)
  readonly members?: MemberRequest[]
}
