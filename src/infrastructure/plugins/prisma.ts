import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: '192.168.11.11',
  port: 3306,
  user: 'root',
  password: '123456789',
  database: 'streaming',
  // host: process.env.DB_HOST!,
  // port: Number(process.env.DB_PORT!),
  // user: process.env.DB_USER!,
  // password: process.env.DB_PASS!,
  // database: process.env.DB_NAME!,
  // acquireTimeout: 10000,
  // ※ connectionString は使わない
});

export const prisma = new PrismaClient({ adapter });
export type IPrismaClient = PrismaClient