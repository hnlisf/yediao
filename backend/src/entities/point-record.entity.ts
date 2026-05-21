import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum PointAction {
  REGISTER = 'register',
  LOGIN = 'login',
  POST_CREATED = 'post_created',
  POST_LIKED = 'post_liked',
  COMMENT_CREATED = 'comment_created',
  SPOT_UPLOADED = 'spot_uploaded',
  SPOT_APPROVED = 'spot_approved',
  RECOGNITION = 'recognition',
  PROTECTED_RELEASE = 'protected_release',
  PROTECTED_REPORT = 'protected_report',
  RECOGNITION_RELEASE = 'recognition_release',
  GATHERING_JOIN = 'gathering_join',
  DAILY_CHECKIN = 'daily_checkin',
}

@Entity('point_records')
export class PointRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: PointAction, comment: '动作类型' })
  action: PointAction;

  @Column({ type: 'int', comment: '积分变化(正/负)' })
  points: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'uuid', nullable: true, comment: '关联业务ID' })
  refId: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
