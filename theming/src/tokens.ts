/** DI token for the seeded book list, provided in `app.module.ts` so
 * `TopBooksWidget` can demonstrate real constructor injection even though
 * this example has no external database to connect to. */
export const BOOKS_SEED = Symbol('BOOKS_SEED');
