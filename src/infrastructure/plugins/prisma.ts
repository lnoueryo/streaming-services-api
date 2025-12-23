import { Injectable } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaFactory {
  private prisma: IPrismaClient | null = null
  create(): IPrismaClient {
    if (!this.prisma) {
      this.prisma = new PrismaClient({
        log: [
          {
            emit: 'stdout',
            level: 'query'
          },
          {
            emit: 'stdout',
            level: 'error'
          },
          {
            emit: 'stdout',
            level: 'info'
          },
          {
            emit: 'stdout',
            level: 'warn'
          }
        ]
      })
    }
    return this.prisma
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements
    Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
    > {}

// export type IPrismaClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">

export type IPrismaClient = PrismaService | Prisma.TransactionClient
