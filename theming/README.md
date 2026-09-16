# example-theming

Palettes, a brand logo, and a DI-based custom widget — no database, no
Docker, no `.env` file. Same `Author`/`Book` domain as `example-in-memory`,
trimmed down so the focus stays on branding and the widget API.

## Run it

```sh
npm install
npm run start:dev
```

Then open http://localhost:4006/admin and sign in with:

- email: `admin@example.com`
- password: `password`

Note: `example-audit-log` also defaults to port `4006` — run only one at a time, or override `PORT`.

## What to look at

- `src/app.module.ts` — the whole theming surface in one place:
  - `panel.palette('violet')` — a named preset. Swap the commented-out line
    for `palette: { seed: '#7c3aed' }` to see the single-seed-color generator
    produce an equivalent palette instead.
  - `panel.radius`/`fontFamily`/`spacing` — the rest of the theming knobs.
  - `panel.logoUrl` — a small inline SVG data URI. **Comment this line out**
    and reload to see the fallback: a badge with the brand name's
    capitalized first letter ("N"), shown both expanded and collapsed.
  - Collapse the sidebar (⌘/Ctrl+B, or the trigger in the header) to see the
    logo/initial swap to icon-only mode, with the brand name hidden.
- `src/widgets/top-books.widget.ts` — `TopBooksWidget`, a DI-based custom
  widget: `@Injectable() @AdminWidget() class TopBooksWidget extends BarChart`,
  with the book list injected via a plain Nest provider token (`BOOKS_SEED`).
  Registered by being listed in `app.module.ts`'s `providers` — no
  `panel.widgets([...])` entry needed, unlike a plain closure widget.
  Contrast with `examples/typeorm/src/books/books-per-year.widget.ts`, which
  builds the same kind of chart as a closure over a `DataSource` — reach for
  that style when there's no DI benefit, and this style once a widget needs
  an injected repository/service.

Restarting the app resets all data — it only lives in memory for the
process lifetime.
