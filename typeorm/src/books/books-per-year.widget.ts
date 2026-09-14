import { BarChart } from '@nestjs-dash/core';
import type { DataSource } from 'typeorm';
import { BookEntity } from './book.entity.js';

/**
 * Real TypeORM aggregate query (group by published year), not a fake/static
 * array — demonstrates a chart widget's data-loader closing over a live
 * `DataSource`, the same pattern `example-bullmq`'s widget uses for
 * `tasksQueue`, since `ResourceAdapter` has no aggregate method to call.
 */
export function buildBooksPerYearWidget(dataSource: DataSource): BarChart {
  return BarChart.make()
    .title('Books published per year')
    .category('year')
    .series([{ key: 'count', label: 'Books', color: 1 }])
    .emptyLabel('No books yet — add some to see this chart.')
    .data(async () => {
      const rows = await dataSource
        .getRepository(BookEntity)
        .createQueryBuilder('book')
        .select('book.published_year', 'year')
        .addSelect('COUNT(*)', 'count')
        .groupBy('book.published_year')
        .orderBy('book.published_year', 'ASC')
        .getRawMany<{ year: number; count: string }>();
      return rows.map((row) => ({ year: String(row.year), count: Number(row.count) }));
    });
}
