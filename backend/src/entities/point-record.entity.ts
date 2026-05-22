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

@Entity('points')
export class PointRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'int', comment: '用户ID' })
  userId: number;

  @ManyToOne(() => User, user => user.pointRecords)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, comment: '来源' })
  source: string;

  @Column({ type: 'int', comment: '积分变化(正/负)' })
  points: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '描述' })
  description: string;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}
