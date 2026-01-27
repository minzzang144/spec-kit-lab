import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  const feOrigin = process.env.FE_ORIGIN || 'http://localhost:5173';

  app.enableCors({
    origin: feOrigin,
    credentials: true,
  });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
