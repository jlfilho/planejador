import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { accessTokenSecret, assertSameSiteRefreshTopology, webOrigin } from './common/security-config';

async function bootstrap() {
  accessTokenSecret();
  assertSameSiteRefreshTopology();
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({ origin: webOrigin(), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Planejador BNCC API').setVersion('1.0').addBearerAuth().build());
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
