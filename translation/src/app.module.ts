import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { TypeOrmAdapter } from '@nestjs-dash/typeorm';
import { TranslatableModule } from '@nestjs-dash/translation';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locales.js';
import { ProductMysqlEntity } from './products/product-mysql.entity.js';
import { ProductMysqlResource } from './products/product-mysql.resource.js';
import { ProductEntity } from './products/product.entity.js';
import { ProductResource } from './products/product.resource.js';
import { seedProductsIfEmpty } from './products/seed.js';

// DB_DRIVER picks which TypeORM connection (and which of the two otherwise-identical
// @TranslatableColumn()-decorated entities, since the storage type — 'jsonb' vs 'json' — must be
// passed explicitly to the decorator, before a connection/driver exists) this example boots
// against. Run once with each value to see both column types; the admin panel only ever hosts one
// connection/resource pair at a time (see docs/architecture.md for why a Resource is bound to a
// single DataSource).
const driver = process.env.DB_DRIVER === 'mysql' ? 'mysql' : 'postgres';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    driver === 'mysql'
      ? TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'mysql' as const,
            url: config.get<string>('MYSQL_URL'),
            entities: [ProductMysqlEntity],
            synchronize: true,
          }),
        })
      : TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'postgres' as const,
            url: config.get<string>('DATABASE_URL'),
            entities: [ProductEntity],
            synchronize: true,
          }),
        }),
    TranslatableModule.forRoot({
      defaultLocale: DEFAULT_LOCALE,
      fallbackLocale: DEFAULT_LOCALE,
      supportedLocales: SUPPORTED_LOCALES,
    }),
    AdminModule.forRootAsync({
      inject: [ConfigService, DataSource],
      useFactory: async (config: ConfigService, dataSource: DataSource) => {
        await seedProductsIfEmpty(dataSource, driver === 'mysql' ? ProductMysqlEntity : ProductEntity);

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
            brandName: `NestJS Dash — Translation Example (${driver})`,
            theme: 'system',
            colors: { primary: 'oklch(0.55 0.12 200)' },
            plugins: [TypeOrmAdapter.forRoot()],
          },
        };
      },
    }),
  ],
  providers: [driver === 'mysql' ? ProductMysqlResource : ProductResource],
})
export class AppModule {}
