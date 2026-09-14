import {
    BulkDeleteAction,
    CreateAction,
    DeleteAction,
    EditAction,
    Resource,
    TextColumn,
    TextInput,
    ViewAction,
    type Schema,
    type Table,
} from '@nestjs-dash/core';
import { AdminResource } from '@nestjs-dash/nestjs';
import { Injectable } from '@nestjs/common';

// @AdminResource() + @Injectable() — discovered via Nest's DiscoveryService
// (see `providers: [...]` in app.module.ts) instead of being listed in
// `panel.resources([...])` like AuthorResource/BookResource above. Both
// paths end up in the same resource registry; this is the decorator-based
// registration alternative — see examples/typeorm, examples/mikroorm and
// examples/bullmq for the same decorator, and examples/in-memory for the
// other "no decoratable entity class" adapter.
//
// Prisma's generated models can't be decorated (see docs/architecture.md
// §4, "Two-layer adapters"), so column capabilities here can only come
// from the Resource Builder (`.sortable()`/`.searchable()`/`.filterable()`
// below) — never from `@Sortable()`/`@Searchable()`/`@Filterable()`
// property decorators, which need a real decoratable entity class. See
// examples/typeorm or examples/mikroorm's `publisher.entity.ts` for those.
@Injectable()
@AdminResource()
export class PublisherResource extends Resource {
  static override slug = 'publishers';
  static override label = 'Publishers';
  static override navigationIcon = 'building-2';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        TextColumn.make('name').label('Name').sortable().searchable(),
        TextColumn.make('country').label('Country').filterable(),
      ])
      .actions([ViewAction.make(), EditAction.make(), DeleteAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()])
      .defaultSortBy([['name', 'ASC']]);
  }

  static override form(form: Schema) {
    return form.components([
      TextInput.make('name').required().label('Name'),
      TextInput.make('country').required().label('Country'),
    ]);
  }
}
