import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para permitir requisições do frontend
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://bozosbarbeiros.vercel.app',
      'https://*.vercel.app', // Preview deployments
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Ativar validação global (para funcionar os DTOs)
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
