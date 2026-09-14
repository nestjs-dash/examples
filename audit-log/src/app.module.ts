import { AuditLogEntity } from '@nestjs-dash/audit-log';
import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { TypeOrmAdapter } from '@nestjs-dash/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { buildAuditEventsByActionWidget, buildAuditEventsTodayWidget } from './audit-activity.widget.js';
import { AuthorEntity } from './authors/author.entity.js';
import { BookEntity } from './books/book.entity.js';
import { seedBooksIfEmpty } from './books/seed.js';
import { LibraryModule } from './library.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        // AuditLogEntity has to be listed explicitly, same as any other
        // entity — TypeORM's DataSource only knows about entities passed
        // here at connection time; it doesn't discover one just because
        // `@nestjs-dash/audit-log` gets `import()`-ed at Nest bootstrap.
        entities: [AuthorEntity, BookEntity, AuditLogEntity],
        synchronize: true,
      }),
    }),
    AdminModule.forRootAsync({
      inject: [ConfigService, DataSource],
      useFactory: async (config: ConfigService, dataSource: DataSource) => {
        await seedBooksIfEmpty(dataSource);

        return {
          autoBindTypeOrm: true,
          dataSource,
          // Turns on the `AdminAuditInterceptor` (already always registered
          // in core — see `packages/nestjs/src/features/audit`) actually
          // persisting to `AuditLogEntity` on every create/update/delete/
          // bulk/relation mutation. Requires a TypeORM `dataSource` (audit
          // storage is TypeORM-only) and `@nestjs-dash/audit-log` installed —
          // AdminModule dynamically `import()`s it at bootstrap only when
          // this flag is set, so it never loads (or needs to be installed)
          // for apps that don't enable it.
          audit: { enabled: true },
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
            brandName: 'NestJS Dash — Audit Log Example',
            // No plugin entry for @nestjs-dash/audit-log — it isn't an
            // `AdminPlugin` like `TypeOrmAdapter.forRoot()`. It's enabled
            // purely via the `audit` flag above; AdminModule registers its
            // read-only "Activity" resource (nav group "System") for you.
            plugins: [TypeOrmAdapter.forRoot()],
            widgets: [
              buildAuditEventsTodayWidget(dataSource),
              buildAuditEventsByActionWidget(dataSource),
            ],
          },
        };
      },
    }),
    LibraryModule,
  ],
})
export class AppModule {}
