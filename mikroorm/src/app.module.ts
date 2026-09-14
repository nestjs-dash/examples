import { EntityManager } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { defineConfig } from '@mikro-orm/postgresql';
import { bindMikroOrmResourcesFromModels, MikroOrmAdapter } from '@nestjs-dash/mikroorm';
import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthorEntity } from './authors/author.entity.js';
import { AuthorResource } from './authors/author.resource.js';
import { BookEntity } from './books/book.entity.js';
import { BookResource } from './books/book.resource.js';
import { PublisherEntity } from './publishers/publisher.entity.js';
import { PublisherResource } from './publishers/publisher.resource.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        defineConfig({
          clientUrl: config.get<string>('DATABASE_URL'),
          entities: [AuthorEntity, BookEntity, PublisherEntity],
          debug: false,
        }),
    }),
    AdminModule.forRootAsync({
      inject: [ConfigService, EntityManager],
      useFactory: (config: ConfigService, em: EntityManager) => {
        // Binding a resource's `.adapter` (via its `static model`) and
        // registering it for Nest DI discovery are independent concerns —
        // PublisherResource needs both: it's included here so
        // `bindMikroOrmResourcesFromModels` sets its adapter, AND it's
        // `@AdminResource()`-decorated + listed in `providers` below so
        // Nest's DiscoveryService finds it. There's no `autoBindMikroOrm`
        // equivalent to TypeORM's `autoBindTypeOrm`, so new resources must
        // be added to this array by hand.
        bindMikroOrmResourcesFromModels([AuthorResource, BookResource, PublisherResource], em);

        return {
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
            brandName: 'NestJS Dash — MikroORM Example',
            // PublisherResource is NOT listed here — it's discovered via
            // Nest's DiscoveryService instead (see `providers` below and
            // the comment on PublisherResource itself). Both paths merge
            // into the same resource registry (deduped by slug).
            resources: [AuthorResource, BookResource],
            plugins: [MikroOrmAdapter.forRoot()],
          },
        };
      },
    }),
  ],
  providers: [PublisherResource],
})
export class AppModule {}
