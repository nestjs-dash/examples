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

export class AuthorResource extends Resource {
  static override slug = 'authors';
  static override label = 'Authors';
  static override navigationIcon = 'user';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        TextColumn.make('name').label('Name').sortable().searchable(),
      ])
      .actions([ViewAction.make(), EditAction.make(), DeleteAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()])
      .defaultSortBy([['name', 'ASC']]);
  }

  static override form(form: Schema) {
    return form.components([TextInput.make('name').required().label('Name')]);
  }
}
