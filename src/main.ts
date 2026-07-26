import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Habilitar CORS para permitir llamadas desde el frontend
  app.enableCors();

  // Pipe global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Arroja error si se envían propiedades no definidas
      transform: true, // Transforma los payloads a las instancias de los DTOs
    }),
  );

  // Configuración de Swagger (Documentación)
  const config = new DocumentBuilder()
    .setTitle('API Destapa')
    .setDescription(
      'Backend orquestador para Destapa (ex Lupa Pública). Integra datos de Mercado Público, Indicadores Económicos, Sismos y Geolocalización.',
    )
    .setVersion('1.0')
    .addTag('Dashboard')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger Docs available at: http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap', err);
});
