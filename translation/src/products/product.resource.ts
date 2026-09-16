import {
  BulkDeleteAction,
  CreateAction,
  DeleteAction,
  EditAction,
  Resource,
  TextColumn,
  TextInput,
  ViewAction,
  translatableColumn,
  translatableInput,
  type Schema,
  type Table,
} from '@nestjs-dash/core';
import { AdminResource } from '@nestjs-dash/nestjs';
import { Injectable } from '@nestjs/common';
import { SUPPORTED_LOCALES } from '../locales.js';
import { ProductEntity } from './product.entity.js';

// @AdminResource() + @Injectable() — discovered via Nest's DiscoveryService (see
// `providers: [...]` in app.module.ts), same registration style as examples/typeorm.
@Injectable()
@AdminResource()
export class ProductResource extends Resource {
  static override slug = 'products';
  static override label = 'Products';
  static override model = ProductEntity;
  static override navigationIcon = 'package';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        // Shows the fixed 'en' value in the list — there's no per-request "current admin
        // locale" concept, so a list column always shows one author-chosen locale.
        translatableColumn('name', 'en').label('Name (EN)'),
        TextColumn.make('price').label('Price').sortable(),
      ])
      .actions([ViewAction.make(), EditAction.make(), DeleteAction.make()])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()]);
  }

  static override form(form: Schema) {
    return form.components([
      translatableInput('name', SUPPORTED_LOCALES, { label: 'Name', required: true }),
      translatableInput('details', SUPPORTED_LOCALES, { label: 'Details', multiline: true }),
      TextInput.make('price').required().label('Price'),
    ]);
  }
}
