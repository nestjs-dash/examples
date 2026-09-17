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
import { Infolist, TextEntry, Section } from '@nestjs-dash/infolists';

export class AuthorResource extends Resource {
  static override slug = 'authors';
  static override label = 'Authors';
  static override navigationIcon = 'user';

  /** Per-resource UI: scoped colors + classNames (see UI overrides docs). */
  static override ui = {
    colors: { primary: 'color-mix(in oklab, oklch(0.55 0.2 290) 70%, white)' },
    classNames: { page: 'authors-page' },
    customCss: '[data-afi-resource="authors"] .authors-page h1 { letter-spacing: 0.02em; }',
  };

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
    return form.components([
      TextInput.make('name').required().label('Name'),
      Select.make('type')
        .label('Type')
        .live()
        .options([
          { label: 'Person', value: 'person' },
          { label: 'Business', value: 'business' },
        ]),
      TextInput.make('company')
        .label('Company')
        .visibleWhen({ field: 'type', op: 'eq', value: 'business' })
        .requiredWhen({ field: 'type', op: 'eq', value: 'business' }),
      Select.make('country')
        .label('Country')
        .live()
        .options([
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
        ]),
      Select.make('city')
        .label('City')
        .dependsOn(['country'])
        .visibleWhen({ field: 'country', op: 'filled' })
        .optionsUrl('/admin/authors/_/field-options/city')
        .options([
          { label: 'New York', value: 'nyc', parent: 'US' },
          { label: 'Toronto', value: 'tor', parent: 'CA' },
        ]),
    ]);
  }

  static override view(view: Infolist) {
    return view.components([
      TextEntry.make('name').label('Name'),
      TextEntry.make('type').label('Type'),
      Section.make('Location').components([
        TextEntry.make('country').label('Country'),
        TextEntry.make('city').label('City'),
      ]),
    ]);
  }
}
