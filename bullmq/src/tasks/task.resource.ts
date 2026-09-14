import {
    Action,
    BulkDeleteAction,
    CreateAction,
    DeleteAction,
    EditAction,
    Resource,
    TextColumn,
    TextInput,
    ViewAction,
    type Schema,
    type Table,
} from '@nestjs-dash/core';
import { tasksQueue } from './queue.js';
import { TaskEntity } from './task.entity.js';

export class TaskResource extends Resource {
  static override slug = 'tasks';
  static override label = 'Tasks';
  static override model = TaskEntity;
  static override navigationIcon = 'list-checks';

  static override table(table: Table) {
    return table
      .columns([
        TextColumn.make('id').label('ID'),
        TextColumn.make('title').label('Title').sortable().searchable(),
        TextColumn.make('status').label('Status').sortable(),
      ])
      .actions([
        ViewAction.make(),
        EditAction.make(),
        // A task whose title starts with "flaky" deliberately fails its
        // first two attempts in the worker (see tasks.worker.ts) — enqueue
        // one to see a real retry in the Queue Explorer.
        Action.make('run')
          .label('Run')
          .icon('play')
          .handler(async (ctx) => {
            const title = String(ctx.record?.title ?? '');
            const id = String(ctx.record?.id ?? '');
            const jobName = title.toLowerCase().startsWith('flaky') ? 'flaky-job' : 'process-task';

            await tasksQueue.add(
              jobName,
              { taskId: id, title },
              { attempts: 3, backoff: { type: 'fixed', delay: 1000 } },
            );
            await ctx.adapter.update(id, { status: 'queued' });

            return { message: `Enqueued "${jobName}" for "${title}"` };
          }),
        DeleteAction.make(),
      ])
      .toolbarActions([CreateAction.make().icon('plus')])
      .bulkActions([BulkDeleteAction.make()])
      .defaultSortBy([['title', 'ASC']]);
  }

  static override form(form: Schema) {
    return form.components([TextInput.make('title').required().label('Title')]);
  }
}
