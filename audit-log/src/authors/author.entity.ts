import { Filterable, Searchable, Sortable } from '@nestjs-dash/typeorm';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { BookEntity } from '../books/book.entity.js';

@Entity('authors')
export class AuthorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  @Sortable()
  @Searchable()
  name!: string;

  @Column({ type: 'varchar' })
  @Searchable()
  @Filterable(['$eq'])
  email!: string;

  @OneToMany(() => BookEntity, (book) => book.author)
  books!: Relation<BookEntity[]>;
}
