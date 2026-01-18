import { Injectable } from '@nestjs/common'
import { IStreamingRepository } from 'src/application/ports/repositories/streaming.repository'
import { Video } from 'src/domain/entities/video.entity'
import { PrismaService } from 'src/infrastructure/plugins/prisma'
import * as fs from 'fs'
import * as path from 'path'
import { config } from 'src/config'

@Injectable()
export class StreamingRepository implements IStreamingRepository {
  private readonly basePath: string = config.recordingStorePath
  constructor() {}
  async getVideos(roomId: string) {
    const roomPath = path.join(this.basePath, roomId)
    const recordings: Video[] = []

    const dirs = fs.readdirSync(roomPath, { withFileTypes: true })

    for (const dirent of dirs) {
      if (!dirent.isDirectory()) continue

      const recordingId = dirent.name
      const recordingPath = path.join(roomPath, recordingId)

      const hlsPath = path.join(recordingPath, 'index.m3u8')
      const thumbPath = path.join(recordingPath, 'thumb.jpg')
      const mp4Path = path.join(recordingPath, 'source.mp4')

      // HLS がなければ無効な録画
      if (!fs.existsSync(hlsPath)) continue
      if (!fs.existsSync(thumbPath)) continue
      if (!fs.existsSync(mp4Path)) continue

      const stat = fs.statSync(recordingPath)

      recordings.push(
        new Video({
          recordingId,
          createdAt: stat.birthtime,
          hlsUrl: `/streaming/space/${roomId}/${recordingId}/index.m3u8`,
          thumbnailUrl: `/streaming/space/${roomId}/${recordingId}/thumb.jpg`,
          size: fs.existsSync(mp4Path) ? fs.statSync(mp4Path).size : undefined
        })
      )
    }
    return recordings
  }
}
