import type { TranslationMap } from '@nestjs-dash/translation';
import { TranslatableColumn } from '@nestjs-dash/translation/typeorm';
import { Filterable } from '@nestjs-dash/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Postgres variant — `@TranslatableColumn('jsonb')` stores the locale map in a `jsonb` column.
 *
 * `name`/`details` deliberately don't use `@Sortable()`/`@Searchable()`: those compare the raw
 * JSON column, which isn't what "sort/search by product name" should mean for a translated field.
 * Sorting/filtering by a translated value in SQL needs `TranslationQueryService` instead — see its
 * README section in `@nestjs-dash/translation`.
 */
@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TranslatableColumn('jsonb')
  name!: TranslationMap;

  @TranslatableColumn('jsonb')
  details!: TranslationMap;

  @Column({ type: 'numeric' })
  @Filterable(['$gte', '$lte'])
  price!: number;
}
