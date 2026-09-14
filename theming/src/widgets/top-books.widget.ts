import { BarChart, type ChartRow } from '@nestjs-dash/core';
import { AdminWidget } from '@nestjs-dash/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import type { Book } from '../books/book.model.js';
import { BOOKS_SEED } from '../tokens.js';

/**
 * A DI-based custom widget — the Filament-equivalent story: extend a chart
 * builder (its constructor is `protected`, not `private`, specifically so
 * this works), inject real dependencies, and register the class in a
 * module's `providers` array instead of building a closure by hand.
 * Contrast with `examples/typeorm/src/books/books-per-year.widget.ts`,
 * which builds the same kind of chart as a plain closure over a `DataSource`
 * — reach for that style when there's no DI benefit, and this style once a
 * widget needs an injected repository/service.
 */
@Injectable()
@AdminWidget()
export class TopBooksWidget extends BarChart {
  constructor(@Inject(BOOKS_SEED) private readonly books: Book[]) {
    super();
    this.title('Books published per year')
      .category('year')
      .series([{ key: 'count', label: 'Books', color: 1 }])
      .emptyLabel('No books yet — add some to see this chart.')
      .data(() => this.booksPerYear());
  }

  private booksPerYear(): ChartRow[] {
    const counts = new Map<number, number>();
    for (const book of this.books) {
      counts.set(book.publishedYear, (counts.get(book.publishedYear) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a - b)
      .map(([year, count]) => ({ year: String(year), count }));
  }
}
