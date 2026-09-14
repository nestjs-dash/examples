/**
 * The in-memory adapter has no real entity/model class to bind against —
 * `createInMemoryResourceFromModel()` derives properties from
 * `Resource.table()`'s declared columns instead (see `author.resource.ts`).
 * This interface exists purely to type the seed data in `app.module.ts`.
 */
export interface Author {
  id: string;
  name: string;
  email: string;
  // Index signature so seed arrays satisfy `RecordData` (`Record<string, unknown>`)
  // expected by `createInMemoryResourceFromModel({ records })`.
  [key: string]: unknown;
}
