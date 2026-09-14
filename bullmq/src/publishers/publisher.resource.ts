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
import { PublisherEntity } from './publisher.entity.js';

// @AdminResource() + @Injectable() — discovered via Nest's DiscoveryService
// instead of `AdminModule.forFeature([TaskResource])` (see
// tasks.module.ts, TaskResource's own registration style). Both paths
// merge into the same resource registry; this is the decorator-based
// registration alternative — see examples/typeorm/examples/mikroorm for
// the same decorator, and examples/in-memory/examples/prisma for the
// "no decoratable entity class" adapters.
//
// Unlike TaskResource's `table()`, this one doesn't re-declare
// `.sortable()`/`.searchable()`/`.filterable()` on its columns — they're
// left unset here on purpose, so the capabilities come purely from
// `PublisherEntity`'s `@Sortable()`/`@Searchable()`/`@Filterable()`
// decorators (the "Entity Decorator" precedence layer). See
// docs/architecture.md §4 for the full three-layer precedence rule.
@Injectable()
@AdminResource()
export class PublisherResource extends Resource {
  static override slug = 'publishers';
  static override label = 'Publishers';
  static override model = PublisherEntity;
  static override navigationIcon = 'building-2';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        TextColumn.make('name').label('Name'),
        TextColumn.make('country').label('Country'),
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
