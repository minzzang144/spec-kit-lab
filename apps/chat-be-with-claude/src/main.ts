import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    },
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger OpenAPI documentation setup
  const config = new DocumentBuilder()
    .setTitle('Chat Backend API')
    .setDescription('Real-time chat application backend API with Socket.IO')
    .setVersion('1.0')
    .addTag('users', 'User management operations')
    .addTag('rooms', 'Chat room management operations')
    .addTag('chat', 'Real-time chat operations')
    .addTag('type-schema', 'Type schema generation for frontend')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3001;
  console.log(`🚀 Chat Backend Server running on port ${port}`);
  console.log(`📚 Swagger API Documentation: http://localhost:${port}/api`);

  await app.listen(port);
}

bootstrap();
