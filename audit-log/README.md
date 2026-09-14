# example-audit-log

Same `Author`/`Book` schema as `examples/typeorm`, with `@nestjs-dash/audit-log`
turned on to record every create/update/delete/bulk/relation mutation made
through the admin UI (`AdminController`). Mutations made only through the
JSON API are not audited.


## What "audit" actually is

Audit logging is a **core + plugin split**, not a `panel.plugins([...])`
entry:

- **Core** (`@nestjs-dash/nestjs`) already always runs `AdminAuditInterceptor`
  on every `AdminController` route. It decides *what* to audit (every
  `@AdminAction(...)`-tagged mutating route, skipping `'view'`) and builds
  the `before`/`after` payload — but it does nothing with that payload
  unless audit is turned on.
- **The plugin** (`@nestjs-dash/audit-log`) supplies the actual persistence
  (`AuditLogEntity`, a TypeORM table) and a read-only `AdminActivityResource`
  for browsing it. `AdminModule` dynamically `import()`s this package at
  bootstrap only when `audit.enabled` is `true` — it's an ordinary
  dependency in `package.json`, but no source file in this example ever
  imports `AdminActivityResource` or wires it into `panel.resources`
  itself; `AdminModule` registers it for you under the "System" nav group.

Turning it on is two lines in `app.module.ts`:

```ts
AdminModule.forRootAsync({
  inject: [ConfigService, DataSource],
  useFactory: async (config: ConfigService, dataSource: DataSource) => ({
    autoBindTypeOrm: true,
    dataSource, // required — audit storage is TypeORM-only, and unlike
    // `autoBindTypeOrm` (which can find a DataSource via Nest DI on its
    // own), audit logging insists on getting one explicitly.
    audit: { enabled: true },
    // ...
  }),
}),
```

`src/audit-activity.widget.ts` goes one step further and queries
`AuditLogEntity` directly (same TypeORM entity the plugin persists to) to
build two dashboard widgets — proof that the audit trail is just a normal
table you can report on, not a black box only the built-in Activity page
can read.

## Run it

```sh
docker compose up -d            # from this directory
cp .env.example .env
pnpm install
pnpm --filter example-audit-log start:dev
```

`synchronize: true` creates the `authors`/`books`/`nestjs_dash_audit_log`
tables automatically on first boot. Note that `AuditLogEntity` has to be
listed in `TypeOrmModule.forRootAsync`'s `entities: [...]` array explicitly
(see `app.module.ts`) — TypeORM's `DataSource` only knows about entities
passed there at connection time; it won't discover `AuditLogEntity` just
because `@nestjs-dash/audit-log` gets `import()`-ed at Nest bootstrap.

Then open http://localhost:4006/admin and sign in with:

- email: `admin@example.com`
- password: `password`

## What to look at

1. Edit or delete a seeded author/book (or create a new one) from the
   admin UI.
2. Open **Activity** in the sidebar (under the "System" group) —
   `AdminActivityResource`, auto-registered by `AdminModule` — and see the
   action you just took, with the actor (`admin@example.com`), the
   resource/record it touched, and the full `before`/`after` snapshot.
3. Try a relation action too: open an author, go to its "Books" tab, and
   dissociate a book — that shows up in Activity as its own distinct
   action, not a generic "update".
4. Check the dashboard's two extra widgets ("Audit events today", "Audit
   events by action") — both query `AuditLogEntity` directly in
   `src/audit-activity.widget.ts`, rather than going through the Activity
   resource's adapter.
5. `src/app.module.ts` — the `audit: { enabled: true }` + `dataSource` wiring
   described above.
6. `src/library.module.ts` / `src/authors/author.resource.ts` /
   `src/books/book.resource.ts` — the same `@AdminResource()`-decorated
   registration style as `examples/typeorm` (see that example's README for
   the full comparison against `forFeature([...])` and plain
   `panel.resources([...])`).
