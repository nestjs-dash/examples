import { createInMemoryResourceFromModel, type InMemoryResource } from '@nestjs-dash/in-memory';
import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { Module } from '@nestjs/common';
import type { Author } from './authors/author.model.js';
import { AuthorResource } from './authors/author.resource.js';
import type { Book } from './books/book.model.js';
import { BookResource } from './books/book.resource.js';
import { BOOKS_SEED } from './tokens.js';
import { TopBooksWidget } from './widgets/top-books.widget.js';

const authors: Author[] = [
  { id: '1', name: 'Ursula K. Le Guin' },
  { id: '2', name: 'Octavia E. Butler' },
];

const books: Book[] = [
  { id: '1', title: 'The Left Hand of Darkness', publishedYear: 1969, authorId: '1' },
  { id: '2', title: 'The Dispossessed', publishedYear: 1974, authorId: '1' },
  { id: '3', title: 'Kindred', publishedYear: 1979, authorId: '2' },
  { id: '4', title: 'Parable of the Sower', publishedYear: 1993, authorId: '2' },
];

const adapters = new Map<string, InMemoryResource>();
const resolveRelated = (slug: string) => adapters.get(slug);

const authorAdapter = createInMemoryResourceFromModel(AuthorResource, {
  records: authors,
  resolveRelated,
});
adapters.set('authors', authorAdapter);
AuthorResource.adapter = authorAdapter;

const bookAdapter = createInMemoryResourceFromModel(BookResource, {
  records: books,
  resolveRelated,
});
adapters.set('books', bookAdapter);
BookResource.adapter = bookAdapter;

/**
 * A small violet "N" mark as a data URI — no static-asset serving needed for
 * this example. In a real app, point `.logo()` at any absolute or relative
 * URL your app already serves (a public asset, a CDN, etc).
 */
const LOGO_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%237c3aed'/%3E%3Ctext x='16' y='21' font-family='system-ui,sans-serif' font-size='16' font-weight='700' fill='white' text-anchor='middle'%3EN%3C/text%3E%3C/svg%3E";

@Module({
  imports: [
    AdminModule.forRoot({
      auth: credentialsAuthResolver({
        secret: process.env.ADMIN_SESSION_SECRET ?? 'dev-only-insecure-secret-change-me',
        validate: async (email, password) => {
          if (email === 'admin@example.com' && password === 'password') {
            return { id: '1', email, name: 'Admin' };
          }
          return null;
        },
      }),
      panel: {
        id: 'admin',
        path: '/admin',
        apiPath: '/api',
        brandName: 'Nova Library',
        resources: [AuthorResource, BookResource],

        // --- Theming: pick ONE of these two lines. ---
        // A named preset — one of 'slate' | 'violet' | 'blue' | 'emerald' | 'amber' | 'rose'.
        palette: 'violet',
        // Or generate a palette from a single brand color instead:
        // palette: { seed: '#7c3aed' },
        // `.colors()`/`.darkColors()` (below) still override individual tokens
        // a palette generated, applied after it per the documented merge order.
        radius: '0.75rem',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        spacing: '0.26rem',

        // --- Branding: comment this out to see the fallback — a badge with
        // the brand name's capitalized first letter ("N"), shown both
        // expanded and collapsed (⌘/Ctrl+B to toggle the sidebar). ---
        logoUrl: LOGO_DATA_URI,

        // DI-based custom widget (`@AdminWidget()`) — see
        // `src/widgets/top-books.widget.ts`. Discovered automatically because
        // `TopBooksWidget` is listed in this module's `providers` below; no
        // `widgets: [...]` entry needed here, unlike a plain closure widget.
      },
    }),
  ],
  providers: [{ provide: BOOKS_SEED, useValue: books }, TopBooksWidget],
})
export class AppModule {}
