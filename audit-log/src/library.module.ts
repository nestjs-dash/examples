import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from './authors/author.entity.js';
import { AuthorResource } from './authors/author.resource.js';
import { BookEntity } from './books/book.entity.js';
import { BookResource } from './books/book.resource.js';

// No `AdminModule.forFeature([...])` here — AuthorResource/BookResource are
// `@AdminResource()`-decorated, so listing them as plain providers is
// enough. AdminModule.forRootAsync (in app.module.ts) already imports
// DiscoveryModule globally, which scans every provider in the app for that
// decorator at bootstrap and registers matches into the same resource
// registry forFeature([...]) would have written to directly. The audited
// "Activity" resource (`admin-activity`) is registered separately by
// `AdminModule` itself once `audit.enabled` is true — see app.module.ts.
@Module({
  imports: [TypeOrmModule.forFeature([AuthorEntity, BookEntity])],
  providers: [AuthorResource, BookResource],
})
export class LibraryModule {}
