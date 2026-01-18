import { Inject, Injectable, Logger } from '@nestjs/common'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { config } from 'src/config'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class GetTargetVideoUseCase {
  constructor(
    @Inject(ISpaceRepository)
    private readonly spaceRepository: ISpaceRepository
  ) {}

  async do({
    roomId,
    recordingId,
    filename,
    user
  }: {
    roomId: string
    recordingId: string
    filename: string
    user: { id: string }
  }): Promise<
    UseCaseResult<
      {
        path: string
      },
      'forbidden' | 'validation' | 'not-found' | 'internal'
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
      const basePath = path.join(config.recordingStorePath, roomId, recordingId)
      const filePath = path.join(basePath, filename)

      if (!fs.existsSync(basePath) || !fs.existsSync(filePath)) {
        return {
          error: {
            type: 'not-found',
            message: '録画が見つかりません。'
          }
        }
      }
      return {
        success: {
          path: filePath
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
