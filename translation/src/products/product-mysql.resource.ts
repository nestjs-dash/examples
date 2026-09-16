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
import { ProductMysqlEntity } from './product-mysql.entity.js';

/** Same resource definition as `ProductResource`, wired to the MySQL (`json`-column) entity. */
@Injectable()
@AdminResource()
export class ProductMysqlResource extends Resource {
  static override slug = 'products';
  static override label = 'Products';
  static override model = ProductMysqlEntity;
  static override navigationIcon = 'package';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
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
