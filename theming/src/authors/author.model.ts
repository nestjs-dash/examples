/**
 * The in-memory adapter has no real entity/model class to bind against —
 * `createInMemoryResourceFromModel()` derives properties from
 * `Resource.table()`'s declared columns instead (see `author.resource.ts`).
 * This interface exists purely to type the seed data in `app.module.ts`.
 *
 * No catch-all index signature here on purpose — `Book.author` uses this
 * type for `EntityKey<Book>`'s `'author.name'`-style dot-path narrowing
 * (see `book.model.ts`), and an index signature would collapse `keyof
 * Author` to plain `string`, silently disabling that check.
 */
export interface Author {
  id: string;
  name: string;
}
