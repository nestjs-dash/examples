import { AdminModule } from '@nestjs-dash/nestjs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity.js';
import { TaskResource } from './task.resource.js';
import { TasksWorker } from './tasks.worker.js';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), AdminModule.forFeature([TaskResource])],
  providers: [TasksWorker],
})
export class TasksModule {}
