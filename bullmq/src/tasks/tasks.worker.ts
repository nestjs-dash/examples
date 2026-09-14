import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Worker } from 'bullmq';
import { Repository } from 'typeorm';
import { connection } from './queue.js';
import { TaskEntity } from './task.entity.js';

@Injectable()
export class TasksWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TasksWorker.name);
  private worker?: Worker;

  constructor(@InjectRepository(TaskEntity) private readonly tasks: Repository<TaskEntity>) {}

  onModuleInit(): void {
    this.worker = new Worker(
      'tasks',
      async (job: Job) => {
        // Deliberately fail a "flaky-job" on its first two attempts so the
        // Queue Explorer has a real retry to show — `attemptsMade` is the
        // count of *completed* attempts, so it's 0 on the first run.
        if (job.name === 'flaky-job' && job.attemptsMade < 2) {
          throw new Error(`Simulated flaky failure (attempt ${job.attemptsMade + 1}/3)`);
        }

        const taskId = String(job.data.taskId ?? '');
        if (taskId) {
          await this.tasks.update({ id: taskId }, { status: 'done' });
        }
      },
      { connection },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.warn(`Job ${job?.id} (${job?.name}) failed: ${err.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
