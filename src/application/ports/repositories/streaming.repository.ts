import { Space, SpacePrivacy } from 'src/domain/entities/space.entity'
import { IRepository } from './repository'
import { Video } from 'src/domain/entities/video.entity'

export const IStreamingRepository = Symbol('IStreamingRepository')

export interface IStreamingRepository {
  getVideos(roomId: string): Promise<Video[]>
}
