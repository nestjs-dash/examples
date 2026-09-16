# example-in-memory

The fastest way to try nestjs-dash — no database, no Docker, no `.env` file.
`AuthorResource` and `BookResource` are backed by
`createInMemoryResourceFromModel()` from `@nestjs-dash/in-memory`, seeded
with a few records directly in `src/app.module.ts`. Same `Author` has-many
`Book` domain model used by the `example-typeorm`/`example-mikroorm`/
`example-prisma`/`example-audit-log` apps, but here it's the reference
adapter the adapter-contract test suite itself checks every other adapter
against.

## Run it

```sh
npm install
npm run start:dev
```

Then open http://localhost:4001/admin and sign in with:

- email: `admin@example.com`
- password: `password`

## What to look at

- `src/authors/author.resource.ts` — `AuthorResource` with a
  `BooksRelationManager` (has-many `Book`, matching `authorId`).
- `src/books/book.resource.ts` — `BookResource` with a belongs-to `Select`
  field (`Select.make('authorId').relationship({ resource: 'authors', ... })`)
  for picking the author when creating/editing a book.
- `src/publishers/publisher.resource.ts` — `PublisherResource`, registered
  the other way: `@Injectable()` + `@AdminResource()` and listed in
  `app.module.ts`'s Nest `providers`, discovered via `DiscoveryService`
  instead of being listed in `panel.resources([...])`. Both paths land in
  the same resource registry, deduped by slug.
- `src/app.module.ts` — the whole wiring: seed data, assigning
  `Resource.adapter` from `createInMemoryResourceFromModel`, and
  `AdminModule.forRoot({ panel: { resources: [...], pages: [...] } })`. No
  async factory needed since there's no external connection to inject.
- `src/library-overview.page.ts` — `LibraryOverviewPage`, a custom page
  registered via direct `panel.pages([...])` config — no `@AdminPage()`
  decorator, no Nest provider, just a class extending `Page`. This app
  demonstrates two of this repo's three resource/page registration styles
  side by side (direct `panel.resources()/pages()` for
  `AuthorResource`/`BookResource`/`LibraryOverviewPage`, and the
  `@AdminResource()` decorator for `PublisherResource`, also used by
  `examples/typeorm`/`examples/mikroorm`). The third style, `@AdminPage()`,
  is for DI-injected pages (e.g. a database connection) — see
  `@nestjs-dash/nestjs`'s exports.

Restarting the app resets all data — it only lives in memory for the
process lifetime.
