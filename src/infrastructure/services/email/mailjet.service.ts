import { Injectable } from '@nestjs/common'
import { Client, LibraryResponse, SendEmailV3_1 } from 'node-mailjet'
import { IEmailService } from 'src/application/ports/services/email.service'
import { MailjetFactory } from 'src/infrastructure/plugins/mailjet'

@Injectable()
export class MailjetService implements IEmailService {
  private readonly mailjet: Client

  constructor(private readonly mailjetFactory: MailjetFactory) {
    this.mailjet = this.mailjetFactory.create()
  }
  async sendMail(params: {
    from: { email: string; name: string }
    to: { email: string; name: string }[]
    subject: string
    textPart: string
    htmlPart: string
  }): Promise<{
    status: string
    messageId: number
    errors: { statusCode: number; message: string }[]
  }> {
    const data: SendEmailV3_1.Body = {
      Messages: [
        {
          From: {
            Email: params.from.email,
            Name: params.from.name
          },
          To: params.to.map((recipient) => ({
            Email: recipient.email,
            Name: recipient.name
          })),
          Subject: params.subject,
          TextPart: params.textPart,
          HTMLPart: params.htmlPart
        }
      ]
    }

    const result: LibraryResponse<SendEmailV3_1.Response> = await this.mailjet
      .post('send', { version: 'v3.1' })
      .request(data)
    const message = result.body.Messages[0]
    console.log('mailjet result', message)
    return {
      status: message.Status,
      messageId: message.To[0].MessageID,
      errors:
        message?.Errors?.map((error) => {
          return {
            statusCode: error.StatusCode,
            message: error.ErrorMessage
          }
        }) || []
    }
  }
}
