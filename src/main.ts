import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { config } from 'aws-sdk';
async function bootstrap() {
  ConfigModule.forRoot({
    envFilePath: ['.env'],
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      forbidUnknownValues: false,
    }),
  );
  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION'),
    s3BucketEndpoint: true,
  });
  app.setGlobalPrefix('v1/api');
  // app.useGlobalGuards(AuthGuard(''));s
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://example.com',
      'http://www.example.com',
      'http://app.example.com',
      'https://example.com',
      'https://www.example.com',
      'https://app.example1.com',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    // credentials: true,
  });
  await app.listen(configService.get('port') || 4002);
}
bootstrap();
