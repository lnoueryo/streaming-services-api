import { SpacePrivacy } from 'src/domain/entities/space.entity'

export type GetTargetSpaceUser = {
  id: string
  name: string
  email: string
  image: string
}

export class GetTargetSpaceDto {
  id: string
  privacy: SpacePrivacy
  users: GetTargetSpaceUser[]
  constructor(params: {
    id: string
    privacy: SpacePrivacy
    users?: GetTargetSpaceUser[]
  }) {
    this.id = params.id
    this.privacy = params.privacy
    this.users =
      params?.users?.map((user) => {
        const { id, name, email, image } = user
        return {
          id,
          name,
          email,
          image
        }
      }) || []
  }
}
