import { Injectable } from '@nestjs/common'
import { config } from 'src/config'
import { Space } from 'src/domain/entities/space.entity'
import { DomainError } from 'src/domain/errors/domain-error'

type InvitePayload = {
  id: string
}

@Injectable()
export class InviteSpaceService {
  generate(space: Space): string {
    return Buffer.from(
      JSON.stringify({
        id: space.id
      })
    ).toString('base64url')
  }

  decode(hash: string): InvitePayload {
    try {
      const payload = JSON.parse(
        Buffer.from(hash, 'base64url').toString('utf8')
      )
      return {
        id: payload.id
      }
    } catch (error) {
      throw new DomainError({
        type: 'validation',
        message: 'invalid invite hash',
        code: 'invalid-hash'
      })
    }
  }

  createInvitation(space: Space) {
    const token = this.generate(space)
    return {
      from: {
        email: config.mailjet.from.email,
        name: config.mailjet.from.name
      },
      to: space.spaceMembers.map((member) => ({
        email: member.email,
        name: member.email
      })),
      subject: `【ご招待】Space への参加リンクが届きました`,
      htmlPart: `
      <p>
        ${space.creator.email}から <strong>Space</strong> への招待が届いています。
      </p>

      <p>
        下記のボタン、またはリンクから Space に参加してください。<br />
        <span style="color:#888;font-size:12px;">
          ※このリンクは第三者に共有しないでください。
        </span>
      </p>

      <p style="margin:24px 0;">
        <a
          href="${config.allowOrigin}/space/invite/${token}"
          style="
            display:inline-block;
            padding:12px 20px;
            background-color:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          "
        >
          Space に参加する
        </a>
      </p>

      <p style="font-size:12px;color:#666;">
        ボタンが表示されない場合は、以下の URL をブラウザに貼り付けてください。<br />
        <a href="${config.allowOrigin}/space/invite/${token}">${config.allowOrigin}/space/invite/${token}</a>
      </p>

      <hr style="margin:32px 0;" />

      <p style="font-size:12px;color:#888;">
        もしこの招待に心当たりがない場合は、このメールを破棄してください。
      </p>

      <p style="font-size:12px;color:#888;">
        Space サポートチーム
      </p>
      `
    }
  }
}
