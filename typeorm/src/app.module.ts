import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { TypeOrmAdapter } from '@nestjs-dash/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthorEntity } from './authors/author.entity.js';
import { BookEntity } from './books/book.entity.js';
import { buildBooksPerYearWidget } from './books/books-per-year.widget.js';
import { seedBooksIfEmpty } from './books/seed.js';
import { LibraryModule } from './library.module.js';
import { PublisherEntity } from './publishers/publisher.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('DATABASE_URL'),
        entities: [AuthorEntity, BookEntity, PublisherEntity],
        synchronize: true,
      }),
    }),
    AdminModule.forRootAsync({
      inject: [ConfigService, DataSource],
      useFactory: async (config: ConfigService, dataSource: DataSource) => {
        await seedBooksIfEmpty(dataSource);

        return {
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
            brandName: 'NestJS Dash — TypeORM Example',
            theme: 'system',
            colors: { primary: 'oklch(0.55 0.12 200)' },
            sidebarWidth: '18rem',
            spacing: '0.3rem',
            navigationOverrides: {
              authors: { group: 'Catalog', sort: 1 },
              books: { group: 'Catalog', sort: 2 },
            },
            plugins: [TypeOrmAdapter.forRoot()],
            widgets: [buildBooksPerYearWidget(dataSource)],
          },
        };
      },
    }),
    LibraryModule,
  ],
})
export class AppModule {}
