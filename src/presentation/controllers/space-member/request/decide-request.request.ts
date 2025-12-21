import { IsString, IsEnum } from 'class-validator'

export enum DecisionStatus {
  none = 'none',
  approved = 'approved',
  rejected = 'rejected'
}

export class DecideRequestRequest {
  @IsString()
  @IsEnum(DecisionStatus, {
    message: 'status は none | approved | rejected です'
  })
  readonly status!: DecisionStatus
}
