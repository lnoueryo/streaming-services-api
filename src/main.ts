import * as dotenv from 'dotenv'
dotenv.config()
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './infrastructure/plugins/logger';
import * as cookieParser from 'cookie-parser';
import config from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: config.allowOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["set-cookie"],
    },
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap()
