import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import {
    createPrismaResourceFromModel,
    PrismaAdapter,
    type PrismaDelegateLike,
    type PrismaResource,
} from '@nestjs-dash/prisma';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthorResource } from './authors/author.resource.js';
import { BookResource } from './books/book.resource.js';
import { PrismaModule } from './prisma.module.js';
import { PrismaService } from './prisma.service.js';
import { PublisherResource } from './publishers/publisher.resource.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AdminModule.forRootAsync({
      inject: [ConfigService, PrismaService],
      useFactory: (config: ConfigService, prisma: PrismaService) => {
        // No `bindPrismaResourcesFromModels` helper exists — deliberately,
        // per the Prisma adapter's own design (no dependency on the
        // generated client's DMMF types, so no generic "bind from model"
        // scanner is possible). Wiring is explicit, a few lines per
        // resource — which is itself the point of this example.
        //
        // The `as unknown as PrismaDelegateLike` casts below are needed
        // because Prisma's generated delegates type `where` as a specific
        // `{Model}WhereUniqueInput` (requiring `id`) rather than the
        // adapter's intentionally-generic `Record<string, unknown>` — the
        // delegate is structurally compatible at runtime (every generated
        // delegate accepts `{ where: { id } }`), TypeScript just can't see
        // through the generated client's heavy use of generics here.
        //
        // `resolveRelated` is also manual — unlike `bindTypeOrmResourcesFromModels`/
        // `bindMikroOrmResourcesFromModels`, there's no bind-all helper that
        // wires this automatically, so a has-many browse (e.g.
        // `/api/authors/:id/books`) needs each adapter to be able to look
        // up its siblings by slug.
        const adapters = new Map<string, PrismaResource>();
        const resolveRelated = (slug: string) => adapters.get(slug);

        const authorAdapter = createPrismaResourceFromModel(
          AuthorResource,
          prisma.author as unknown as PrismaDelegateLike,
          { resolveRelated },
        );
        adapters.set('authors', authorAdapter);
        AuthorResource.adapter = authorAdapter;

        const bookAdapter = createPrismaResourceFromModel(
          BookResource,
          prisma.book as unknown as PrismaDelegateLike,
          { resolveRelated },
        );
        adapters.set('books', bookAdapter);
        BookResource.adapter = bookAdapter;

        const publisherAdapter = createPrismaResourceFromModel(
          PublisherResource,
          prisma.publisher as unknown as PrismaDelegateLike,
          { resolveRelated },
        );
        adapters.set('publishers', publisherAdapter);
        PublisherResource.adapter = publisherAdapter;

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
            brandName: 'NestJS Dash — Prisma Example',
            // PublisherResource is NOT listed here — it's `@AdminResource()`-
            // decorated instead (see publisher.resource.ts) and discovered
            // via Nest's DiscoveryService because it's listed in this
            // module's `providers` below. Both paths merge into the same
            // resource registry (deduped by slug), so it still shows up in
            // the panel.
            resources: [AuthorResource, BookResource],
            plugins: [PrismaAdapter.forRoot()],
          },
        };
      },
    }),
  ],
  providers: [PublisherResource],
})
export class AppModule {}
