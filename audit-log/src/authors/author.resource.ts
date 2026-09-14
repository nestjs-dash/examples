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
      // DissociateAction here shows up in the Activity log too — the
      // interceptor records it as its own `action`, distinct from a
      // top-level `delete` (see AdminAuditInterceptor's tests for the
      // exact `before`/`after` shape it produces for relation actions).
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

// @AdminResource() + @Injectable() — same decorator-based registration
// style as example-typeorm (see library.module.ts's `providers: [...]`).
// Every create/update/delete/bulk/relation action performed against this
// resource through the admin UI or the JSON API gets recorded to the
// Activity log — see app.module.ts's `audit: { enabled: true }`.
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
