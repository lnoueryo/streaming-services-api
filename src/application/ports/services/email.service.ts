export const IEmailService = Symbol('IEmailService')

export interface IEmailService {
  sendMail(params: {
    from: { email: string; name?: string }
    to: { email: string; name?: string }[]
    subject: string
    textPart?: string
    htmlPart?: string
  }): Promise<{
    status: string
    messageId: number
    errors: { statusCode: number; message: string }[]
  }>
}
