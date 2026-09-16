# example-bullmq

A `Task` admin wired to a real BullMQ queue on Valkey — the first real,
non-mocked exercise of `BullMqQueuePlugin` (it shipped with mock-only test
coverage previously). Creating a task doesn't itself enqueue a job — there's
no `afterCreate` resource hook in nestjs-dash to hang that off — instead each
task row gets a custom **Run** action (`Action.make('run').handler(...)`,
see `src/tasks/task.resource.ts`) that enqueues a real BullMQ job for it and
sets its status to `queued`.

A `TasksWorker` (`src/tasks/tasks.worker.ts`, a plain BullMQ `Worker`
started from `OnModuleInit`) processes jobs on the `tasks` queue: a task
titled `flaky-...` deliberately fails its first two attempts before
succeeding on the third, so retries have something real to show in the
Queue Explorer. Any other task's job succeeds immediately and sets the
task's status to `done`.

## Run it

```sh
docker compose up -d            # from this directory (postgres + valkey)
cp .env.example .env
npm install
npm run start:dev
```

The `nestjs_dash_example_bullmq` database is created by `POSTGRES_DB` in this
example's `docker-compose.yml` on first boot; the `tasks`/`publishers`
tables are auto-synced (`synchronize: true`, same as `example-typeorm`).

Then open http://localhost:4005/admin and sign in with:

- email: `admin@example.com`
- password: `password`

Create a task titled `flaky-import`, click **Run**, then open the **Queue
Explorer** page (or the dashboard widget) to watch it fail twice and
succeed on the third attempt. Create a normal task and click **Run** to see
one complete immediately.

## What to look at

- `src/tasks/queue.ts` — the shared `Queue('tasks', ...)` instance,
  constructed once at module load from `process.env` (not through Nest's
  DI) since it's referenced both by the static `TaskResource.table()` and
  by the worker.
- `src/tasks/task.resource.ts` — the custom **Run** row action.
- `src/tasks/tasks.worker.ts` — the BullMQ `Worker` that processes jobs,
  including the deliberate `flaky-*` retry simulation.
- `src/tasks/job-states.widget.ts` — a `PieChart` dashboard widget built
  from BullMQ's own `getJobCounts()`, shown alongside the queue-explorer
  plugin's own `render()`-based widget.
- `src/publishers/publisher.resource.ts` — a `PublisherResource` unrelated
  to the queue, `@AdminResource()`-decorated and listed as a plain
  `providers` entry in `app.module.ts` (discovered via Nest's
  DiscoveryService) rather than through `AdminModule.forFeature([...])`
  like `TaskResource` (see `src/tasks/tasks.module.ts`).
- `src/app.module.ts` — `panel.plugins([TypeOrmAdapter.forRoot(),
  BullMqQueuePlugin.forRoot({ queues: [tasksQueue] })])`.
