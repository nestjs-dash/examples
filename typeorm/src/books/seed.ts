import type { DataSource } from 'typeorm';
import { AuthorEntity } from '../authors/author.entity.js';
import { BookEntity } from './book.entity.js';

/**
 * Idempotent — only inserts when the `books` table is empty. Makes the
 * "Books published per year" dashboard chart meaningfully non-flat on first
 * boot without requiring manual data entry through the admin UI.
 */
export async function seedBooksIfEmpty(dataSource: DataSource): Promise<void> {
  const books = dataSource.getRepository(BookEntity);
  const authors = dataSource.getRepository(AuthorEntity);

  if ((await books.count()) > 0) {
    return;
  }

  const leGuin = await authors.save(
    authors.create({ name: 'Ursula K. Le Guin', email: 'ursula@example.com' }),
  );
  const butler = await authors.save(
    authors.create({ name: 'Octavia E. Butler', email: 'octavia@example.com' }),
  );

  await books.save([
    books.create({ title: 'Rocannon’s World', publishedYear: 1966, authorId: leGuin.id }),
    books.create({ title: 'A Wizard of Earthsea', publishedYear: 1968, authorId: leGuin.id }),
    books.create({ title: 'The Left Hand of Darkness', publishedYear: 1969, authorId: leGuin.id }),
    books.create({ title: 'The Lathe of Heaven', publishedYear: 1971, authorId: leGuin.id }),
    books.create({ title: 'The Dispossessed', publishedYear: 1974, authorId: leGuin.id }),
    books.create({ title: 'Patternmaster', publishedYear: 1976, authorId: butler.id }),
    books.create({ title: 'Wild Seed', publishedYear: 1980, authorId: butler.id }),
    books.create({ title: 'Kindred', publishedYear: 1979, authorId: butler.id }),
    books.create({ title: 'Clay’s Ark', publishedYear: 1984, authorId: butler.id }),
    books.create({ title: 'Dawn', publishedYear: 1987, authorId: butler.id }),
    books.create({ title: 'Parable of the Sower', publishedYear: 1993, authorId: butler.id }),
    books.create({ title: 'Parable of the Talents', publishedYear: 1998, authorId: butler.id }),
  ]);
}
