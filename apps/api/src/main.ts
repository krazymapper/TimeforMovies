import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Global validation pipe with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS configuration
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get('PORT', 3001);
  await app.listen(port);

  console.log(`🚀 API is running on: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

