import { AuditLogEntity } from '@nestjs-dash/audit-log';
import { AdminModule, credentialsAuthResolver, type AdminModuleOptions } from '@nestjs-dash/nestjs';
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
          // Cast needed because of a pre-existing, repo-wide pnpm quirk:
          // TypeORM declares every DB driver (mongodb, mysql2, pg, ...) as
          // an *optional peer dependency*, so pnpm allocates a separate
          // physical `typeorm@1.1.1` copy per unique combination of those
          // optional peers (+ @types/node version) visible to a given
          // package. This app's own `typeorm` import (this file pins
          // `@types/node: ^24`, matching most other examples) resolves to a
          // different physical copy than the one `@nestjs-dash/nestjs`'s
          // prebuilt `dist/*.d.ts` was compiled against (root/packages/*
          // still pin `@types/node: ^22`), so TypeScript treats the two
          // `DataSource` types as structurally incompatible even though
          // they're the identical npm version at runtime. Reproduces on an
          // unmodified `AdminModule.forRoot({ audit: { enabled: true },
          // dataSource })` too — unrelated to audit specifically. Cast to
          // `AdminModuleOptions['dataSource']` specifically (not back to
          // this file's own `DataSource`) — that's the nominal type on the
          // *other* side of the mismatch.
          dataSource: dataSource as unknown as AdminModuleOptions['dataSource'],
          // Turns on the `AdminAuditInterceptor` (already always registered
          // in core — see `packages/nestjs/src/features/audit`) actually
          // persisting audit entries on every create/update/delete/bulk/
          // relation mutation. `@nestjs-dash/audit-log` installed —
          // AdminModule dynamically `import()`s it at bootstrap only when
          // `enabled` is set, so it never loads (or needs to be installed)
          // for apps that don't enable it.
          //
          // `channels`/`default` are optional — omitting them behaves
          // exactly like `audit: { enabled: true }` alone (a single
          // implicit `database` channel). This example wires up a `stack`
          // so every mutation lands in BOTH places at once, to demonstrate
          // the channel system:
          //  - `database`: the original behavior — `AuditLogEntity`, browsable
          //    via the built-in "Activity" resource below.
          //  - `file`: appends one NDJSON line per entry under this app's
          //    working directory (default path `audit/{resource}/{level}.log`,
          //    e.g. `audit/authors/info.log`) — NOT visible in "Activity",
          //    which only ever reads from the `database` channel.
          audit: {
            enabled: true,
            default: 'stack',
            channels: {
              database: { driver: 'database' },
              file: { driver: 'file' },
              stack: { driver: 'stack', channels: ['database', 'file'] },
            },
          },
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
