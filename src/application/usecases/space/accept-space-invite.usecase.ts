import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ISpaceRepository } from 'src/application/ports/repositories/space.repository'
import { UseCaseResult } from 'src/application/ports/usecases/usecase-result'
import { InviteSpaceService } from 'src/domain/services/space/invite-space.service'
import { ISpaceMemberRepository } from 'src/application/ports/repositories/space-member.repository'
import { Space } from 'src/domain/entities/space.entity'

type AcceptSpaceInviteUseCaseResult = {
  redirect: string
  space: {
    id: string
    name?: string
    privacy: string
  }
}
@Injectable()
export class AcceptSpaceInviteUseCase {
  constructor(
    @Inject(forwardRef(() => ISpaceRepository))
    private readonly spaceRepository: ISpaceRepository,
    @Inject(forwardRef(() => ISpaceMemberRepository))
    private readonly spaceMemberRepository: ISpaceMemberRepository,
    @Inject('InviteSpaceService')
    private readonly inviteSpaceService: InviteSpaceService
  ) {}

  async do(params: {
    user: { id: string; email: string }
    hash: string
  }): Promise<
    UseCaseResult<
      AcceptSpaceInviteUseCaseResult,
      'not-found' | 'forbidden' | 'internal'
    >
  > {
    try {
      /*
      hashをデコード
      hashが不正ならnot-foundエラーを返す
      デコードした情報からspaceを取得
      space+spaceMemberを取得
      spaceが存在しなければnot-foundエラーを返す
      space.publicがpublicならそのままスルーしてリダイレクト
      spaceMemberに自分のレコードが存在しなければvalidationエラーを返す（一旦招待された人のみ）
      spaceMemberのstatusがapprovedでなければvalidationエラーを返す
      正常ならspace情報を返す
      */
      // TODO : inviteの有効期限有無、チェック、decodeエラーの処理を実装する
      const spaceInvite = this.inviteSpaceService.decode(params.hash)
      const space = await this.spaceRepository.findSpace(spaceInvite.id)
      if (!space) {
        return {
          error: {
            type: 'not-found',
            message: '部屋が存在しません'
          }
        }
      }
      if (space.privacy === 'public') {
        return {
          success: {
            space: {
              id: space.id,
              name: space.name,
              privacy: space.privacy
            },
            redirect: `/spaces/${space.id}`
          }
        }
      } else if (space.privacy === 'protected') {
        const spaceMember = space.spaceMembers.find((member) => {
          return member.email === params.user.email
        })
        if (spaceMember) {
          if (!spaceMember.userId) {
            await this.spaceMemberRepository.update({
              spaceId: spaceMember.spaceId,
              userId: params.user.id,
              email: spaceMember.email
            })
          }
          return {
            success: {
              space: {
                id: space.id,
                name: space.name,
                privacy: space.privacy
              },
              redirect: `/spaces/${space.id}`
            }
          }
        }
        const newSpaceMember = await this.spaceMemberRepository.create({
          role: 'member',
          status: 'none',
          spaceId: space.id,
          userId: params.user.id,
          email: params.user.email
        })
        return {
          success: {
            space: {
              id: space.id,
              name: space.name,
              privacy: space.privacy
            },
            redirect: `/spaces/${space.id}`
          }
        }
      } else if (space.privacy === 'private') {
        const spaceMember = space.spaceMembers.find((member) => {
          return member.email === params.user.email
        })
        if (!spaceMember) {
          return {
            error: {
              type: 'forbidden',
              message: '招待されていないため参加できません'
            }
          }
        }
        if (!spaceMember.userId) {
          await this.spaceMemberRepository.update({
            spaceId: spaceMember.spaceId,
            userId: params.user.id,
            email: spaceMember.email
          })
        }
        return {
          success: {
            space: {
              id: space.id,
              name: space.name,
              privacy: space.privacy
            },
            redirect: `/spaces/${space.id}`
          }
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
