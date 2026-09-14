import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 4003;
  await app.listen(port);
  console.log(`example-mikroorm listening on http://localhost:${port}/admin`);
}
await bootstrap();
