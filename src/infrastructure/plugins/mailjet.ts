import { Client } from 'node-mailjet'
import { config } from '../../config'
import { Injectable } from '@nestjs/common'
import {
  RequestConfig,
  RequestOptions
} from 'node-mailjet/declarations/request/Request'

@Injectable()
export class MailjetFactory {
  create(params?: {
    config?: Partial<RequestConfig> | null | undefined
    options?: RequestOptions | null | undefined
  }): Client {
    return new Client({
      apiKey: config.mailjet.apiKeyPublic,
      apiSecret: config.mailjet.apiKeyPrivate,
    })
  }
}
