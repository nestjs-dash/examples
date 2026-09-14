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
import { BookEntity } from './book.entity.js';

export class BookResource extends Resource {
  static override slug = 'books';
  static override label = 'Books';
  static override model = BookEntity;
  static override navigationIcon = 'book';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        TextColumn.make('title').label('Title').sortable().searchable(),
        TextColumn.make('publishedYear').label('Published').sortable(),
        TextColumn.make('authorId').label('Author'),
      ])
      .actions([ViewAction.make(), EditAction.make(), DeleteAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()])
      .defaultSortBy([['publishedYear', 'DESC']]);
  }

  static override form(form: Schema) {
    return form.components([
      TextInput.make('title').required().label('Title'),
      TextInput.make('publishedYear').required().label('Published year'),
      Select.make('authorId')
        .relationship({ resource: 'authors', titleAttribute: 'name' })
        .required()
        .label('Author'),
    ]);
  }
}
