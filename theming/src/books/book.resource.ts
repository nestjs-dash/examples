import {
  BulkDeleteAction,
  CreateAction,
  DeleteAction,
  EditAction,
  Resource,
  Select,
  TextColumn,
  TextInput,
  ViewAction,
  type Schema,
  type Table,
} from '@nestjs-dash/core';
import { Infolist, TextEntry } from '@nestjs-dash/infolists';
import type { Book } from './book.model.js';

/**
 * `Resource.for<Book>()` (instead of plain `Resource`) checks every inline
 * `.make(...)` call in `table()`/`form()`/`view()` below against `Book`'s
 * keys, plus one level of relation dot-paths (`'author.name'`) — try
 * changing `'title'` to a typo to see it fail to compile.
 */
export class BookResource extends Resource.for<Book>() {
  static override slug = 'books';
  static override label = 'Books';
  static override navigationIcon = 'book';

  static override table(table: Table<Book>) {
    return table
      .columns([
        TextColumn.make('title').label('Title').sortable().searchable(),
        TextColumn.make('publishedYear').label('Published').sortable(),
        TextColumn.make('authorId').label('Author'),
      ])
      .actions([ViewAction.make(), EditAction.make(), DeleteAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()])
      .defaultSortBy([['publishedYear', 'DESC']]);
  }

  static override form(form: Schema<Book>) {
    return form.components([
      TextInput.make('title').required().label('Title'),
      TextInput.make('publishedYear').required().label('Published year'),
      Select.make('authorId')
        .relationship({ resource: 'authors', titleAttribute: 'name' })
        .required()
        .label('Author'),
    ]);
  }

  static override view(view: Infolist<Book>) {
    return view.components([
      TextEntry.make('title').label('Title'),
      TextEntry.make('publishedYear').label('Published'),
      // One level of relation dot-path — checked against `Author`'s keys.
      TextEntry.make('author.name').label('Author'),
    ]);
  }
}
