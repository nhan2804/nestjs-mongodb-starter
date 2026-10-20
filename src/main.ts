import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { urlencoded, json } from 'express';
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
  // config.update({
  //   accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
  //   secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
  //   region: configService.get('AWS_REGION'),
  //   s3BucketEndpoint: true,
  // });
  app.setGlobalPrefix('v1/api', {
    exclude: ['r/:shortUrl'],
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // app.useGlobalGuards(AuthGuard(''));s
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  const port = configService.get('PORT') || configService.get('port') || 4002;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend server running on http://0.0.0.0:${port}/v1/api`);
}
bootstrap();
