import { Inject, Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { config } from 'src/config'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { IStreamingRepository } from 'src/application/ports/repositories/streaming.repository'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class GetVideoUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository,
    @Inject(IStreamingRepository)
    private readonly streamingRepository: IStreamingRepository
  ) {}

  async do({ roomId, user }: { roomId: string; user: { id: string } }): Promise<
    UseCaseResult<
      {
        videos: {
          roomId: string
          recordingId: string
          createdAt: Date
          hlsUrl: string
          thumbnailUrl: string
          size?: number
        }[]
      },
      'forbidden' | 'validation' | 'internal'
    >
  > {
    try {
      const space = await this.spaceRepository.findSpace(roomId)
      if (!space) {
        return {
          error: {
            type: 'validation',
            message: 'スペースが見つかりません。'
          }
        }
      }
      const spaceMember = space.getSpaceMemberByUserId(user.id)
      if (!spaceMember) {
        return {
          error: {
            type: 'forbidden',
            message: 'スペースのメンバーではありません。'
          }
        }
      }
      const basePath = config.recordingStorePath
      const roomPath = path.join(basePath, roomId)

      if (!fs.existsSync(roomPath)) {
        return {
          success: { videos: [] }
        }
      }

      const videos = await this.streamingRepository.getVideos(roomId)

      videos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return {
        success: {
          videos: videos.map((video) => ({
            roomId,
            recordingId: video.recordingId,
            createdAt: video.createdAt,
            hlsUrl: video.hlsUrl,
            thumbnailUrl: video.thumbnailUrl,
            size: video.size
          }))
        }
      }
    } catch (error) {
      Logger.error(error)
      return {
        error: {
          type: 'internal',
          message: 'Internal Server Error'
        }
      }
    }
  }
}
