import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('post_comments')
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.postComments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', comment: '动态ID' })
  postId: string;

  @ManyToOne(() => Post, post => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column({ type: 'text', comment: '评论内容' })
  content: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
