import { AdminModule } from '@nestjs-dash/nestjs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await AdminModule.setupSwagger(app);

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  console.log(`example-in-memory listening on http://localhost:${port}/admin`);
  console.log(`example-in-memory Swagger docs at http://localhost:${port}/api/docs`);
}
await bootstrap();
