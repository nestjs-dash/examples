import type { DataSource } from 'typeorm';
import { AuthorEntity } from '../authors/author.entity.js';
import { BookEntity } from './book.entity.js';

/**
 * Idempotent — only inserts when the `books` table is empty. Seeds just
 * enough data to immediately try edit/delete/dissociate actions and see
 * them land in the Activity log, without requiring manual data entry first.
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
    books.create({ title: 'The Left Hand of Darkness', publishedYear: 1969, authorId: leGuin.id }),
    books.create({ title: 'The Dispossessed', publishedYear: 1974, authorId: leGuin.id }),
    books.create({ title: 'Kindred', publishedYear: 1979, authorId: butler.id }),
    books.create({ title: 'Parable of the Sower', publishedYear: 1993, authorId: butler.id }),
  ]);
}
