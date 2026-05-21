import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index
} from 'typeorm';
import { User } from './user.entity';
import { Spot } from './spot.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('spot_comments')
@Index(['spotId', 'createdAt'])
@Index(['userId'])
@Index(['parentId'])
export class SpotComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.spotComments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', comment: '钓点ID' })
  spotId: string;

  @ManyToOne(() => Spot, spot => spot.comments)
  @JoinColumn({ name: 'spotId' })
  spot: Spot;

  @Column({ type: 'uuid', nullable: true, comment: '父评论ID（回复）' })
  parentId: string;

  @ManyToOne(() => SpotComment, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: SpotComment;

  @Column({ type: 'text', comment: '评论内容' })
  content: string;

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likeCount: number;

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.APPROVED, comment: '审核状态' })
  status: CommentStatus;

  @Column({ type: 'int', default: 0, comment: '回复数' })
  replyCount: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
