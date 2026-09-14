# example-prisma

`Author`/`Book`/`Publisher` admin wired against a real Postgres database via
`@nestjs-dash/prisma`. Pinned to Prisma **6.19.3** (the current stable
major) rather than `latest`, which currently resolves to a 7.x/8.x
pre-release with a substantially different CLI and schema format (no more
`datasource { url = ... }` — connection config moved to `prisma.config.ts` +
driver adapters). 6.x keeps the familiar `schema.prisma` + generated
`PrismaClient` workflow this example is meant to demonstrate.

Unlike the TypeORM/MikroORM examples, there's no `bindPrismaResourcesFromModels`
auto-bind helper — deliberately, since the Prisma adapter has no dependency
on `@prisma/client`'s generated DMMF types (a library can't depend on types
that only exist after a *consumer* runs `prisma generate` against their own
schema). Wiring each resource's adapter is a few explicit lines instead,
which is itself the point of this example — see `src/app.module.ts`.

## Run it

```sh
docker compose up -d            # from this directory
cp .env.example .env
pnpm install                    # runs `prisma generate` via postinstall
pnpm --filter example-prisma db:push
pnpm --filter example-prisma start:dev
```

`pnpm install`'s `postinstall` script runs `prisma generate`, which
downloads Prisma's query-engine binary from Prisma's own CDN on first run
(a different host than the npm registry) — if that's blocked in your
environment, `prisma generate` will fail with a network error; there's no
manual workaround for that step, engines aren't published to npm.

`db:push` creates the `authors`/`books`/`publishers` tables in the
`nestjs_dash_example_prisma` database (created by `POSTGRES_DB` in this
example's `docker-compose.yml` on first boot).

Then open http://localhost:4004/admin and sign in with:

- email: `admin@example.com`
- password: `password`

## What to look at

- `prisma/schema.prisma` — the `Author`/`Book`/`Publisher` models and the
  Author↔Book relation.
- `src/prisma.service.ts` / `src/prisma.module.ts` — the standard
  NestJS+Prisma `PrismaService extends PrismaClient` pattern, exported from
  a `@Global()` module so `AdminModule.forRootAsync`'s factory can inject it.
- `src/authors/author.resource.ts` / `src/books/book.resource.ts` /
  `src/publishers/publisher.resource.ts` — plain `Resource` subclasses with
  no `static model` (Prisma resources derive their properties from
  `resource.table()`'s declared columns, not model introspection — there's
  nothing to decorate on a Prisma model). `PublisherResource` is also
  `@AdminResource()`-decorated and listed in `providers` (discovered via
  Nest's DiscoveryService), unlike `AuthorResource`/`BookResource`, which
  are listed directly in `panel.resources([...])`.
- `src/app.module.ts` — `AuthorResource.adapter =
  createPrismaResourceFromModel(AuthorResource, prisma.author)` and the
  same for `BookResource`/`PublisherResource`, right in the
  `AdminModule.forRootAsync` factory.
