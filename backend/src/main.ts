import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('AutoMech API')
    .setDescription('Marketplace de Serviços Automotivos - API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('mechanics', 'Mechanic profiles and search')
    .addTag('service-requests', 'Service request management')
    .addTag('quotes', 'Quote management')
    .addTag('reviews', 'Reviews and ratings')
    .addTag('analytics', 'Analytics events')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚗 AutoMech API running on http://localhost:${port}`);
  console.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
