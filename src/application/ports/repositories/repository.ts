import { IPrismaClient } from 'src/infrastructure/plugins/prisma'

export interface IRepository<TThis> {
  transaction(tx: IPrismaClient): TThis
}
