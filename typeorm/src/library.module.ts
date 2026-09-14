import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorEntity } from './authors/author.entity.js';
import { AuthorResource } from './authors/author.resource.js';
import { BookEntity } from './books/book.entity.js';
import { BookResource } from './books/book.resource.js';
import { PublisherEntity } from './publishers/publisher.entity.js';
import { PublisherResource } from './publishers/publisher.resource.js';

// No `AdminModule.forFeature([...])` here — AuthorResource/BookResource/
// PublisherResource are all `@AdminResource()`-decorated, so listing them
// as plain providers is enough. AdminModule.forRootAsync (in app.module.ts)
// already imports DiscoveryModule globally, which scans every provider in
// the app for that decorator at bootstrap and registers matches into the
// same resource registry forFeature([...]) would have written to directly.
@Module({
  imports: [TypeOrmModule.forFeature([AuthorEntity, BookEntity, PublisherEntity])],
  providers: [AuthorResource, BookResource, PublisherResource],
})
export class LibraryModule {}
