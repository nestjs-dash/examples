import {
    BulkDeleteAction,
    CreateAction,
    DeleteAction,
    DissociateAction,
    EditAction,
    RelationManager,
    Resource,
    TextColumn,
    TextInput,
    ViewAction,
    type Schema,
    type Table,
} from '@nestjs-dash/core';
import { AdminResource } from '@nestjs-dash/nestjs';
import { Injectable } from '@nestjs/common';
import { AuthorEntity } from './author.entity.js';

export class BooksRelationManager extends RelationManager {
  static override relationship = 'books';
  static override type = 'has-many' as const;
  static override relatedResource = 'books';
  static override foreignKey = 'authorId';
  static override title = 'Books';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('title').label('Title').sortable().searchable(),
        TextColumn.make('publishedYear').label('Published').sortable(),
      ])
      .actions([EditAction.make(), DissociateAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .defaultSortBy([['publishedYear', 'DESC']]);
  }

  static override form(form: Schema) {
    return form.components([
      TextInput.make('title').required().label('Title'),
      TextInput.make('publishedYear').required().label('Published year'),
    ]);
  }
}

// @AdminResource() + @Injectable() — discovered via Nest's DiscoveryService
// (see library.module.ts's `providers: [...]`) instead of being listed in
// an explicit AdminModule.forFeature([...]) call. Both end up in the same
// resource registry; this is the decorator-based alternative — see
// example-bullmq for the forFeature([...]) style, and example-in-memory /
// example-mikroorm / example-prisma for direct `panel.resources([...])`.
@Injectable()
@AdminResource()
export class AuthorResource extends Resource {
  static override slug = 'authors';
  static override label = 'Authors';
  static override model = AuthorEntity;
  static override navigationIcon = 'user';
  static override relationManagers = [BooksRelationManager];

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        TextColumn.make('name').label('Name').sortable().searchable(),
        TextColumn.make('email').label('Email').searchable(),
      ])
      .actions([ViewAction.make(), EditAction.make(), DeleteAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()])
      .defaultSortBy([['name', 'ASC']]);
  }

  static override form(form: Schema) {
    return form.components([
      TextInput.make('name').required().label('Name'),
      TextInput.make('email').email().required().label('Email'),
    ]);
  }
}
