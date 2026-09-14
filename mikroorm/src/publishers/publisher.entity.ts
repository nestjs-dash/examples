import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { Filterable, Searchable, Sortable } from '@nestjs-dash/mikroorm';
import { randomUUID } from 'node:crypto';

@Entity({ tableName: 'publishers' })
export class PublisherEntity {
  @PrimaryKey({ type: 'uuid', onCreate: () => randomUUID() })
  id!: string;

  @Property({ type: 'string' })
  @Sortable()
  @Searchable()
  name!: string;

  @Property({ type: 'string' })
  @Filterable(['$eq'])
  country!: string;
}
