import { Filterable, Searchable, Sortable } from '@nestjs-dash/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('publishers')
export class PublisherEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  @Sortable()
  @Searchable()
  name!: string;

  @Column({ type: 'varchar' })
  @Filterable(['$eq'])
  country!: string;
}
