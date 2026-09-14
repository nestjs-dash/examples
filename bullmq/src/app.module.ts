import { BullMqQueuePlugin } from '@nestjs-dash/bullmq';
import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { TypeOrmAdapter } from '@nestjs-dash/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PublisherEntity } from './publishers/publisher.entity.js';
import { PublisherResource } from './publishers/publisher.resource.js';
import { buildJobStatesWidget } from './tasks/job-states.widget.js';
import { tasksQueue } from './tasks/queue.js';
import { TaskEntity } from './tasks/task.entity.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        entities: [TaskEntity, PublisherEntity],
        synchronize: true,
      }),
    }),
    AdminModule.forRootAsync({
      inject: [ConfigService, DataSource],
      useFactory: (config: ConfigService) => ({
        autoBindTypeOrm: true,
        auth: credentialsAuthResolver({
          secret:
            config.get<string>('ADMIN_SESSION_SECRET') ?? 'dev-only-insecure-secret-change-me',
          validate: async (email, password) => {
            if (email === 'admin@example.com' && password === 'password') {
              return { id: '1', email, name: 'Admin' };
            }
            return null;
          },
        }),
        panel: {
          id: 'admin',
          path: '/admin',
          apiPath: '/api',
          brandName: 'NestJS Dash — BullMQ Example',
          plugins: [TypeOrmAdapter.forRoot(), BullMqQueuePlugin.forRoot({ queues: [tasksQueue] })],
          widgets: [buildJobStatesWidget()],
        },
      }),
    }),
    TasksModule,
  ],
  // PublisherResource is `@AdminResource()`-decorated (unlike TaskResource,
  // which uses `AdminModule.forFeature([...])` in tasks.module.ts) — listing
  // it here as a plain provider is enough for Nest's DiscoveryService to
  // find it and merge it into the same resource registry. `autoBindTypeOrm`
  // above then binds its adapter automatically, same as it does for
  // TaskResource.
  providers: [PublisherResource],
})
export class AppModule {}
