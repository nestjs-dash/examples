import { Filterable, Searchable, Sortable } from '@nestjs-dash/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  @Sortable()
  @Searchable()
  title!: string;

  @Column({ type: 'varchar', default: 'pending' })
  @Sortable()
  @Filterable(['$eq'])
  status!: string;
}
