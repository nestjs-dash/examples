# example-translation

`Product` admin wired against a real database via `@nestjs-dash/translation`'s
`@TranslatableColumn()` — `name`/`details` store `{ en, nl, fr }` locale maps in one JSON column,
edited in the admin form as locale tabs (`translatableInput`) and shown as one fixed locale in the
list view (`translatableColumn`), instead of a raw JSON blob.

`DB_DRIVER` picks which database (and which of two otherwise-identical entities) this example
boots against: `postgres` (default, `jsonb` column) or `mysql` (`json` column) — the storage type
must be passed explicitly to `@TranslatableColumn()`, since decorators run before a connection (and
its driver) exists, so there's a `ProductEntity`/`ProductMysqlEntity` pair rather than one shared
class. Run it once with each `DB_DRIVER` value to see both.

## Run it

```sh
docker compose up -d postgres mysql   # from the repo root
cp .env.example .env
npm install
npm run start:dev
```

`synchronize: true` creates the `products` table automatically on first boot — against
`nestjs_dash_example_translation` on Postgres (created by `docker/postgres-init/01-example-databases.sql`),
or the shared `nestjs-dash` database on MySQL.

Then open http://localhost:4007/admin and sign in with:

- email: `admin@example.com`
- password: `password`

To try the MySQL variant instead:

```sh
DB_DRIVER=mysql npm run start:dev
```

Try `http://localhost:4007/api/products?lang=nl` (or `x-language: nl`) to see the JSON API
localize `name`/`details` down to a single string per the resolved locale, instead of the raw map.

## What to look at

- `src/products/product.entity.ts` / `src/products/product-mysql.entity.ts` — the same fields,
  `@TranslatableColumn('jsonb')` vs `@TranslatableColumn('json')`.
- `src/products/product.resource.ts` / `src/products/product-mysql.resource.ts` — `translatableInput('name', SUPPORTED_LOCALES)` in `form()` (locale-tabbed input, one tab per
  locale) and `translatableColumn('name', 'en')` in `table()` (fixed-locale list column).
- `src/products/seed.ts` — an idempotent seed with intentionally partial translations (one product
  has no `nl` name) to show `fallbackLocale` in action when browsing with `?lang=nl`.
- `src/app.module.ts` — `TranslatableModule.forRoot({ defaultLocale, fallbackLocale,
supportedLocales })` alongside the `DB_DRIVER`-conditional `TypeOrmModule.forRootAsync`/entity/
  resource selection.
- `src/locales.ts` — the `SUPPORTED_LOCALES`/`DEFAULT_LOCALE` shared between the module config and
  both resources.

Docs: [Translation](https://nestjs-dash.zakout.tech/plugins/translation).
