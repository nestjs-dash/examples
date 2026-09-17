/**
 * Not imported by `app.module.ts` — this file exists only so `check-types`
 * compiles it, proving `Resource.for<Book>()`'s entity-key checking works
 * end to end. See `books/book.resource.ts` for the real usage.
 */
import { Table, TextColumn } from '@nestjs-dash/core';
import type { Book } from './books/book.model.js';

declare const table: Table<Book>;

// Valid: 'title' is a real key of Book.
table.columns([TextColumn.make('title')]);

// Valid: one level of relation dot-path into Book.author (an Author).
table.columns([TextColumn.make('author.name')]);

// @ts-expect-error -- 'titel' is not a key of Book (typo for 'title').
table.columns([TextColumn.make('titel')]);

// @ts-expect-error -- 'email' is not a key of Author, so 'author.email' isn't a valid dot-path.
table.columns([TextColumn.make('author.email')]);

// Narrowing only applies when `.make(...)` is written inline inside the
// array literal passed to `.columns()`/`.components()`. Hoisting to an
// intermediate `const` first loses the contextual `Book` type, so the call
// silently falls back to the loose default instead of being checked —
// no `@ts-expect-error` is possible on the line below, even for a typo:
const hoisted = TextColumn.make('not-a-real-book-field');
void hoisted;
