import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Unique
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
@Unique(['userId', 'postId'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

@Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.postLikes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', comment: '动态ID' })
  postId: string;

  @ManyToOne(() => Post, post => post.likes)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn({ comment: '点赞时间' })
  createdAt: Date;
}
