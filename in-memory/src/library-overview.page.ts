import { Page, type PageRenderContext } from '@nestjs-dash/core';
import { AuthorResource } from './authors/author.resource.js';
import { BookResource } from './books/book.resource.js';

/**
 * A plain custom page — no `@AdminPage()` decorator, no Nest providers
 * array, nothing to register anywhere. Just a class extending `Page`,
 * listed directly in `panel.pages([...])` (app.module.ts). The simplest of
 * the three page/resource registration styles this repo's example apps
 * demonstrate:
 *   - direct `panel.pages([...])` / `panel.resources([...])` — this app
 *   - `@AdminResource()` decorator + Nest providers — examples/typeorm
 *   - `@AdminPage()` decorator + Nest providers (for DI-injected pages,
 *     e.g. a database connection)
 *
 * Since resources here have no live database, `content()` reads counts
 * straight off the in-memory adapters already assigned in app.module.ts —
 * the same `find({ page: 1, limit: 1 }).meta.totalItems` trick the
 * dashboard's own resource cards use.
 */
export class LibraryOverviewPage extends Page {
  static override slug = 'library-overview';
  static override title = 'Library Overview';
  static override navigationIcon = 'library';

  override async content(_ctx: PageRenderContext): Promise<string> {

    const [authors, books] = await Promise.all([
      AuthorResource.adapter!.find({ page: 1, limit: 1 }),
      BookResource.adapter!.find({ page: 1, limit: 1 }),
    ]);

    return `
      <div style="display:flex;gap:1rem;">
        <div style="border:1px solid var(--border);border-radius:0.5rem;padding:1rem 1.5rem;">
          <div style="font-size:0.8rem;color:var(--muted-foreground);">Authors</div>
          <div style="font-size:1.75rem;font-weight:600;">${authors.meta.totalItems}</div>
        </div>
        <div style="border:1px solid var(--border);border-radius:0.5rem;padding:1rem 1.5rem;">
          <div style="font-size:0.8rem;color:var(--muted-foreground);">Books</div>
          <div style="font-size:1.75rem;font-weight:600;">${books.meta.totalItems}</div>
        </div>
      </div>
    `;
  }
}
