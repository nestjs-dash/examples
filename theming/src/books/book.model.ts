import type { Author } from '../authors/author.model.js';

/**
 * No catch-all index signature here on purpose — this type is used with
 * `Resource.for<Book>()` (see `book.resource.ts`) to type-check `.make()`
 * field names; an index signature would collapse `keyof Book` to plain
 * `string` and silently disable that checking.
 *
 * `author` isn't populated by this example's in-memory seed data (it's
 * only here to demonstrate the one-level relation dot-path, e.g.
 * `TextEntry.make('author.name')`) — a real adapter (e.g. TypeORM) would
 * populate it from an eager-loaded relation.
 */
export interface Book {
  id: string;
  title: string;
  publishedYear: number;
  authorId: string;
  author?: Author;
}
