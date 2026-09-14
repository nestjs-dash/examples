import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { Filterable, Searchable, Sortable } from '@nestjs-dash/mikroorm';
import { randomUUID } from 'node:crypto';

// Explicit `type` on every `@Property()` — esbuild-based runners (tsx,
// used by `scripts/sync-schema.ts`) don't emit TypeScript's
// `design:type` decorator metadata the way `tsc` does, so MikroORM can't
// infer column types from reflection alone here.
@Entity({ tableName: 'authors' })
export class AuthorEntity {
  @PrimaryKey({ type: 'uuid', onCreate: () => randomUUID() })
  id!: string;

  @Property({ type: 'string' })
  @Sortable()
  @Searchable()
  name!: string;

  @Property({ type: 'string' })
  @Searchable()
  @Filterable(['$eq'])
  email!: string;
}
