import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('CCCCCCCCCC ENV VARIABLES:', JSON.stringify(process.env, null, 2));
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    //forbidNonWhitelisted: true,
    //disableErrorMessages: false,
  }));
  console.log('DDDDDDDDDD ENV VARIABLES:', JSON.stringify(process.env, null, 2));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
