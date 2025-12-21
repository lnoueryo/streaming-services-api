import { IsString, IsEnum } from 'class-validator'

export enum DecisionStatus {
  approved = 'approved',
  rejected = 'rejected'
}

export class DecideRequestRequest {
  @IsString()
  @IsEnum(DecisionStatus, { message: 'status は approved | rejected です' })
  readonly status!: DecisionStatus
}
