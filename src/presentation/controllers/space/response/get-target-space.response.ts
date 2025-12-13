import { GetTargetSpaceDto } from 'src/application/usecases/space/dto/get-target-space.dto'

export class GetTargetSpaceResponse {
  id: string
  privacy: string

  constructor(room: GetTargetSpaceDto) {
    this.id = room.id
    this.privacy = room.privacy
  }
}
