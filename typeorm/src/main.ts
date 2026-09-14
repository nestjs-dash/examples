import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 4002;
  await app.listen(port);
  console.log(`example-typeorm listening on http://localhost:${port}/admin`);
}
await bootstrap();
