import { Queue } from 'bullmq';

// Constructed at module load, from plain `process.env` rather than Nest's
// ConfigService — this instance is referenced both by `TaskResource.table()`
// (a static method, evaluated outside any DI context) and by the worker in
// `tasks.worker.ts`, so it can't depend on Nest's injector being ready.
export const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6380),
};

export const tasksQueue = new Queue('tasks', { connection });
