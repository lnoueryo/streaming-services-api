import { IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetPublicSpaceRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number

  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit: number
}
