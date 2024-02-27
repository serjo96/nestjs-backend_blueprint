import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {Logger} from "nestjs-pino";

import { AppModule } from './app.module';
import {mainConfig} from "~/config/main-config";
import {GlobalExceptionFilter} from "~/common/ExceptionFilter";
import {ValidationPipe} from "@nestjs/common";
import {formatErrors} from "~/common/custom-validations";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  })
  app.setGlobalPrefix('api/v1');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      })
      .setBasePath('v1')
      .setTitle('Blueprint api')
      .setDescription('The blueprint API description')
      .setVersion('1.0')
      .addTag('blueprint')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: formatErrors,
  }));
  await app.listen(mainConfig().project.port);
}
bootstrap();
