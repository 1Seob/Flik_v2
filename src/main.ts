import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filter/exception.filter';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Flik Server')
    .setDescription('Flik API description')
    .setVersion('1.0')
    .addTag('Flik')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 8000; // Cloud Run 환경변수를 사용
  await app.listen(port, '0.0.0.0'); // '0.0.0.0' 바인딩도 권장
}
bootstrap();
