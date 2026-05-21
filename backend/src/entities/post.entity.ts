import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.posts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({ type: 'simple-json', nullable: true, comment: '图片URLs' })
  images: string[];

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likeCount: number;

  @Column({ type: 'int', default: 0, comment: '评论数' })
  commentCount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'text' })
  contentType: string;

  @Column({ type: 'simple-array', nullable: true })
  taggedSpecies: string[];

  @Column({ type: 'simple-array', nullable: true })
  taggedSpots: string[];

  @Column({ default: true, comment: '是否公开' })
  isPublic: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @OneToMany(() => PostLike, like => like.post)
  likes: PostLike[];

  @OneToMany(() => PostComment, comment => comment.post)
  comments: PostComment[];
}
