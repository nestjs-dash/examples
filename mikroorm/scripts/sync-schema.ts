import 'reflect-metadata';
import 'dotenv/config';
import { MikroORM } from '@mikro-orm/postgresql';
import { AuthorEntity } from '../src/authors/author.entity.js';
import { BookEntity } from '../src/books/book.entity.js';
import { PublisherEntity } from '../src/publishers/publisher.entity.js';

const orm = await MikroORM.init({
  clientUrl: process.env.DATABASE_URL,
  entities: [AuthorEntity, BookEntity, PublisherEntity],
});

await orm.schema.update();
console.log('Schema synced.');
await orm.close();
