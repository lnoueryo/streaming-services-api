import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

export type IPrismaClient = PrismaClient

@Injectable()
export class PrismaFactory {
  private prisma: IPrismaClient | null = null
  create(): IPrismaClient {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        log: [
          {
            emit: 'stdout',
            level: 'query',
          },
          {
            emit: 'stdout',
            level: 'error',
          },
          {
            emit: 'stdout',
            level: 'info',
          },
          {
            emit: 'stdout',
            level: 'warn',
          },
        ],
      })
    }
    return this.prisma
  }
}