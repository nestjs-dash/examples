import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { Filterable, Searchable, Sortable } from '@nestjs-dash/mikroorm';
import { randomUUID } from 'node:crypto';
import { AuthorEntity } from '../authors/author.entity.js';

@Entity({ tableName: 'books' })
export class BookEntity {
  @PrimaryKey({ type: 'uuid', onCreate: () => randomUUID() })
  id!: string;

  @Property({ type: 'string' })
  @Sortable()
  @Searchable()
  title!: string;

  @Property({ type: 'integer', fieldName: 'published_year' })
  @Sortable()
  @Filterable(['$eq', '$gte', '$lte'])
  publishedYear!: number;

  // `mapToPk` surfaces the relation as a plain scalar FK (not the related
  // entity instance) — matches the `authorId` field nestjs-dash's Select/
  // relationship field and the other example apps' schemas all expect.
  @ManyToOne(() => AuthorEntity, { fieldName: 'author_id', mapToPk: true })
  @Filterable(['$eq'])
  authorId!: string;
}
