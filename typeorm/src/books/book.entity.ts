import { Filterable, Searchable, Sortable } from '@nestjs-dash/typeorm';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Relation,
} from 'typeorm';
import { AuthorEntity } from '../authors/author.entity.js';

@Entity('books')
export class BookEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  @Sortable()
  @Searchable()
  title!: string;

  @Column({ name: 'published_year', type: 'int' })
  @Sortable()
  @Filterable(['$eq', '$gte', '$lte'])
  publishedYear!: number;

  @Column({ name: 'author_id', type: 'uuid' })
  @Filterable(['$eq'])
  authorId!: string;

  @ManyToOne(() => AuthorEntity, (author) => author.books)
  @JoinColumn({ name: 'author_id' })
  author!: Relation<AuthorEntity>;
}
