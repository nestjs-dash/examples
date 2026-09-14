import { createInMemoryResourceFromModel, type InMemoryResource } from '@nestjs-dash/in-memory';
import { AdminModule, credentialsAuthResolver } from '@nestjs-dash/nestjs';
import { Module } from '@nestjs/common';
import type { Author } from './authors/author.model.js';
import { AuthorResource } from './authors/author.resource.js';
import type { Book } from './books/book.model.js';
import { BookResource } from './books/book.resource.js';
import { LibraryOverviewPage } from './library-overview.page.js';
import type { Publisher } from './publishers/publisher.model.js';
import { PublisherResource } from './publishers/publisher.resource.js';

const authors: Author[] = [
  { id: '1', name: 'Ursula K. Le Guin', email: 'ursula@example.com' },
  { id: '2', name: 'Octavia E. Butler', email: 'octavia@example.com' },
];

const books: Book[] = [
  { id: '1', title: 'The Left Hand of Darkness', publishedYear: 1969, authorId: '1' },
  { id: '2', title: 'The Dispossessed', publishedYear: 1974, authorId: '1' },
  { id: '3', title: 'Kindred', publishedYear: 1979, authorId: '2' },
  { id: '4', title: 'Parable of the Sower', publishedYear: 1993, authorId: '2' },
];

const publishers: Publisher[] = [
  { id: '1', name: 'Ace Books', country: 'USA' },
  { id: '2', name: 'Gollancz', country: 'UK' },
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

const publisherAdapter = createInMemoryResourceFromModel(PublisherResource, {
  records: publishers,
  resolveRelated,
});
adapters.set('publishers', publisherAdapter);
PublisherResource.adapter = publisherAdapter;

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
      swagger: true,
      panel: {
        id: 'admin',
        path: '/admin',
        apiPath: '/api',
        brandName: 'NestJS Dash — In-Memory Example',
        // PublisherResource is NOT listed here — it's `@AdminResource()`-
        // decorated instead (see publisher.resource.ts) and discovered via
        // Nest's DiscoveryService because it's listed in this module's
        // `providers` below. Both paths merge into the same resource
        // registry (deduped by slug), so it still shows up in the panel.
        resources: [AuthorResource, BookResource],
        pages: [LibraryOverviewPage],
      },
    }),
  ],
  providers: [PublisherResource, LibraryOverviewPage],
})
export class AppModule { }
