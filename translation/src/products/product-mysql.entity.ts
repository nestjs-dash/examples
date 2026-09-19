import type { TranslationMap } from '@nestjs-dash/translation';
import { TranslatableColumn } from '@nestjs-dash/translation/typeorm';
import { Filterable } from '@nestjs-dash/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * MySQL variant — identical shape to `ProductEntity`, but `@TranslatableColumn('json')` stores the
 * locale map in a `json` column (MySQL/MariaDB have no `jsonb` type). Kept as a separate entity
 * class rather than one shared class, because the storage type must be passed explicitly to
 * `@TranslatableColumn()` — decorators run before the TypeORM connection (and its driver) exist.
 */
@Entity('products')
export class ProductMysqlEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TranslatableColumn('json')
  name!: TranslationMap;

  @TranslatableColumn('json')
  details!: TranslationMap;

  @Column({ type: 'decimal' })
  @Filterable(['$gte', '$lte'])
  price!: number;
}
