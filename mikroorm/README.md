# example-mikroorm

`Author`/`Book`/`Publisher` admin wired against a real Postgres database via
`@nestjs-dash/mikroorm`. `AuthorEntity`/`BookEntity` use real MikroORM
decorators (`@Entity`/`@PrimaryKey`/`@Property`/`@ManyToOne`) plus
nestjs-dash's `@Sortable`/`@Searchable`/`@Filterable` from
`@nestjs-dash/mikroorm`, stacked on top — same "decorated for the real
ORM first, nestjs-dash's metadata layered on" story as `example-typeorm`.

MikroORM 7 dropped decorator-based entity definitions from `@mikro-orm/core`
itself in favor of the new `defineEntity()` functional API — decorators
(`@Entity`, `@PrimaryKey`, `@Property`, `@ManyToOne`, ...) now live in the
separate `@mikro-orm/decorators` package (`/legacy` subpath, matching this
repo's `experimentalDecorators: true` TypeScript config — there's also an
`/es` subpath for the native TC39 decorators proposal). `@mikro-orm/core`,
`@mikro-orm/decorators`, and `@mikro-orm/postgresql` are all pinned to the
exact same `7.2.0` since `@mikro-orm/decorators` peer-depends on an exact
`@mikro-orm/core` version.

`BookEntity.authorId` uses MikroORM's `mapToPk: true` option on its
`@ManyToOne` so the FK is exposed as a plain scalar string (not the related
entity instance) — matching the `authorId` field nestjs-dash's `Select`
relationship field and every other example app's schema expect.

## Run it

```sh
docker compose up -d            # from this directory
cp .env.example .env
npm install
npm run db:sync                 # first run only — see below
npm run start:dev
```

The `nestjs_dash_example_mikroorm` database is created by `POSTGRES_DB` in
this example's `docker-compose.yml` on first boot. MikroORM's schema isn't
auto-synced by the app itself — on first run, create it with the bundled
sync script (`scripts/sync-schema.ts`, run via `tsx`), as above.

Then open http://localhost:4003/admin and sign in with:

- email: `admin@example.com`
- password: `password`

## What to look at

- `src/authors/author.entity.ts` / `src/books/book.entity.ts` /
  `src/publishers/publisher.entity.ts` — entities decorated for both
  MikroORM and nestjs-dash.
- `src/authors/author.resource.ts` — `AuthorResource` with `static model =
  AuthorEntity` and a `BooksRelationManager`.
- `src/books/book.resource.ts` — `BookResource` with a belongs-to `Select`
  field for picking the author.
- `src/publishers/publisher.resource.ts` — `PublisherResource`,
  `@AdminResource()`-decorated (unlike `AuthorResource`/`BookResource`,
  which are listed directly in `panel.resources([...])`); its `table()`
  leaves `.sortable()`/`.searchable()`/`.filterable()` unset so those
  capabilities come purely from `PublisherEntity`'s decorators.
- `src/app.module.ts` — `MikroOrmModule.forRootAsync` (Postgres connection
  from `DATABASE_URL`) + `AdminModule.forRootAsync`, calling
  `bindMikroOrmResourcesFromModels([...], em)` directly in the factory
  (there's no `autoBindTypeOrm`-style boolean flag for MikroORM — binding
  happens explicitly, which is itself the point of this example). Note that
  binding a resource's adapter and registering it for Nest DI discovery are
  independent: `PublisherResource` needs both, so it's passed to
  `bindMikroOrmResourcesFromModels([...])` *and* listed in `providers`.
