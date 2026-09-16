# example-typeorm

`Author`/`Book`/`Publisher` admin wired against a real Postgres database via
`@nestjs-dash/typeorm` using `autoBindTypeOrm: true`.

Also demonstrates the **decorator-based** resource-registration style:
`AuthorResource`/`BookResource`/`PublisherResource` are `@AdminResource()`-decorated and listed
as plain Nest `providers` (see `src/library.module.ts`) instead of being
passed to `AdminModule.forFeature([...])`. Both approaches end up in the
same resource registry — see `examples/bullmq` for the
`forFeature([...])` style, and `examples/in-memory` /
`examples/mikroorm` / `examples/prisma` for direct
`panel.resources([...])` config.

`AuthorEntity`/`BookEntity` use real `typeorm` decorators
(`@Entity`/`@Column`/`@OneToMany`/`@ManyToOne`) plus nestjs-dash's
`@Sortable`/`@Searchable`/`@Filterable` from `@nestjs-dash/typeorm`,
stacked on top — the entities are decorated for their real ORM first,
nestjs-dash's metadata layered on.

## Run it

```sh
docker compose up -d            # from this directory
cp .env.example .env
npm install
npm run start:dev
```

`synchronize: true` creates the `authors`/`books`/`publishers` tables
automatically on first boot against the `nestjs_dash_example_typeorm`
database (created by `POSTGRES_DB` in this example's `docker-compose.yml`
on first boot).

Then open http://localhost:4002/admin and sign in with:

- email: `admin@example.com`
- password: `password`

## What to look at

- `src/authors/author.entity.ts` / `src/books/book.entity.ts` /
  `src/publishers/publisher.entity.ts` — entities decorated for both
  TypeORM and nestjs-dash.
- `src/authors/author.resource.ts` — `AuthorResource`, `@Injectable()` +
  `@AdminResource()`-decorated, with `static model = AuthorEntity` (what
  `autoBindTypeOrm` binds a repository to) and a `BooksRelationManager`.
- `src/books/book.resource.ts` — `BookResource`, same decorator pattern,
  with a belongs-to `Select` field for picking the author.
- `src/publishers/publisher.resource.ts` — `PublisherResource`, same
  decorator pattern, but its `table()` leaves `.sortable()`/`.searchable()`/
  `.filterable()` unset so those capabilities come purely from
  `PublisherEntity`'s `@Sortable()`/`@Searchable()`/`@Filterable()`
  decorators (the "Entity Decorator" precedence layer).
- `src/books/seed.ts` / `src/books/books-per-year.widget.ts` — an idempotent
  seed (only runs when `books` is empty) and a `BarChart` dashboard widget
  driven by a live TypeORM aggregate query, so the panel shows sample data
  and a non-flat chart on first boot.
- `src/library.module.ts` — `TypeOrmModule.forFeature([...])` +
  `providers: [AuthorResource, BookResource, PublisherResource]`. No
  `AdminModule.forFeature` call needed: `AdminModule.forRootAsync` (in
  `app.module.ts`) already imports `DiscoveryModule` globally, which scans
  every provider in the app for `@AdminResource()` at bootstrap.
- `src/app.module.ts` — `TypeOrmModule.forRootAsync` (Postgres connection
  from `DATABASE_URL`) + `AdminModule.forRootAsync({ autoBindTypeOrm: true,
  panel: { plugins: [TypeOrmAdapter.forRoot()] } })`.
