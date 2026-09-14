export interface Book {
  id: string;
  title: string;
  publishedYear: number;
  authorId: string;
  // Index signature so seed arrays satisfy `RecordData` (`Record<string, unknown>`)
  // expected by `createInMemoryResourceFromModel({ records })`.
  [key: string]: unknown;
}
