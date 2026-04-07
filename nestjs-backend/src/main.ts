import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend access
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Mergington High School NestJS API running on port ${port}`);
}

bootstrap();
